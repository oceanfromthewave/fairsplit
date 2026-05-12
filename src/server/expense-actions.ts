"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { parseWonInput } from "@/lib/money";
import type { ActionState } from "@/server/group-actions";

const expenseSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().trim().min(1, "내용을 입력해 주세요.").max(120),
  amount: z.string().min(1, "금액을 입력해 주세요."),
  paidById: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(1, "나눌 사람을 한 명 이상 선택해 주세요."),
  spentAt: z.string().optional(),
});

async function assertGroupMember(groupId: string, userId: string) {
  const m = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { userId: true },
  });
  return Boolean(m);
}

export async function createExpense(formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const groupId = String(formData.get("groupId") ?? "");
  const title = String(formData.get("title") ?? "");
  const amount = String(formData.get("amount") ?? "");
  const paidById = String(formData.get("paidById") ?? "");
  const spentAtRaw = formData.get("spentAt");
  const participantRaw = formData.getAll("participantIds");

  const participantIds =
    participantRaw.length > 0
      ? participantRaw.map(String)
      : [String(formData.get("participantIds") ?? "")].filter(Boolean);

  const parsed = expenseSchema.safeParse({
    groupId,
    title,
    amount,
    paidById,
    participantIds,
    spentAt: spentAtRaw ? String(spentAtRaw) : undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "지출 정보가 올바르지 않습니다.",
    };
  }

  const amountWon = parseWonInput(parsed.data.amount);
  if (amountWon === null || amountWon <= 0) {
    return { ok: false, message: "금액을 확인해 주세요. (예: 48000)" };
  }

  const { groupId: gid, title: ttl, paidById: payer, participantIds: parts } =
    parsed.data;

  const memberOk = await assertGroupMember(gid, session.user.id);
  if (!memberOk) {
    return { ok: false, message: "이 그룹의 멤버가 아닙니다." };
  }

  const uniqueParts = [...new Set(parts)];
  if (!uniqueParts.includes(payer)) {
    return { ok: false, message: "결제한 사람은 반드시 나눔 대상에 포함되어야 합니다." };
  }

  const members = await db.groupMember.findMany({
    where: { groupId: gid, userId: { in: uniqueParts } },
    select: { userId: true },
  });

  if (members.length !== uniqueParts.length) {
    return { ok: false, message: "참여자는 모두 그룹 멤버여야 합니다." };
  }

  let spentAt = new Date();
  if (parsed.data.spentAt) {
    const d = new Date(parsed.data.spentAt);
    if (!Number.isNaN(d.getTime())) spentAt = d;
  }

  try {
    await db.expense.create({
      data: {
        groupId: gid,
        title: ttl,
        amountCents: amountWon,
        currency: "KRW",
        paidById: payer,
        createdById: session.user.id,
        spentAt,
        shares: {
          create: uniqueParts.map((userId) => ({ userId })),
        },
      },
    });
  } catch (e) {
    logger.error({ err: e }, "create_expense_failed");
    return { ok: false, message: "지출을 저장할 수 없습니다." };
  }

  revalidatePath(`/app/groups/${gid}`);
  return { ok: true, message: "지출이 추가되었습니다." };
}

export async function deleteExpense(expenseId: string, groupId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const expense = await db.expense.findFirst({
    where: { id: expenseId, groupId },
    select: {
      id: true,
      createdById: true,
      group: { select: { ownerId: true } },
    },
  });

  if (!expense) {
    return { ok: false, message: "지출을 찾을 수 없습니다." };
  }

  const isOwner = expense.group.ownerId === session.user.id;
  const isCreator = expense.createdById === session.user.id;
  if (!isOwner && !isCreator) {
    return { ok: false, message: "이 지출을 삭제할 권한이 없습니다." };
  }

  try {
    await db.expense.delete({ where: { id: expenseId } });
  } catch (e) {
    logger.error({ err: e }, "delete_expense_failed");
    return { ok: false, message: "지출을 삭제할 수 없습니다." };
  }

  revalidatePath(`/app/groups/${groupId}`);
  return { ok: true, message: "지출이 삭제되었습니다." };
}

export async function expenseCreateAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  return createExpense(formData);
}

export async function deleteExpenseFromForm(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const expenseId = String(formData.get("expenseId") ?? "");
  const groupId = String(formData.get("groupId") ?? "");
  if (!expenseId || !groupId) {
    return { ok: false, message: "지출 정보가 없습니다." };
  }
  return deleteExpense(expenseId, groupId);
}
