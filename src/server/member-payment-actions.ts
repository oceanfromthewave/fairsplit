"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { parseWonInput } from "@/lib/money";
import type { ActionState } from "@/server/group-actions";

async function assertGroupMember(groupId: string, userId: string) {
  const m = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { userId: true },
  });
  return Boolean(m);
}

const recordSchema = z.object({
  groupId: z.string().min(1),
  fromUserId: z.string().min(1),
  toUserId: z.string().min(1),
  amount: z.string().min(1),
});

export async function recordMemberPaymentFromForm(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const parsed = recordSchema.safeParse({
    groupId: String(formData.get("groupId") ?? ""),
    fromUserId: String(formData.get("fromUserId") ?? ""),
    toUserId: String(formData.get("toUserId") ?? ""),
    amount: String(formData.get("amount") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false, message: "지불 정보가 올바르지 않습니다." };
  }

  const { groupId, fromUserId, toUserId } = parsed.data;
  if (fromUserId === toUserId) {
    return { ok: false, message: "보내는 사람과 받는 사람이 같을 수 없습니다." };
  }

  const amountWon = parseWonInput(parsed.data.amount);
  if (amountWon === null || amountWon <= 0) {
    return { ok: false, message: "금액을 확인해 주세요." };
  }

  const memberOk = await assertGroupMember(groupId, session.user.id);
  if (!memberOk) {
    return { ok: false, message: "이 그룹의 멤버가 아닙니다." };
  }

  if (session.user.id !== toUserId) {
    return {
      ok: false,
      message: "돈을 받는 사람만 지불 완료를 기록할 수 있습니다.",
    };
  }

  const pair = await db.groupMember.findMany({
    where: { groupId, userId: { in: [fromUserId, toUserId] } },
    select: { userId: true },
  });
  if (pair.length !== 2) {
    return { ok: false, message: "보내는 사람과 받는 사람은 모두 그룹 멤버여야 합니다." };
  }

  try {
    await db.memberPayment.create({
      data: {
        groupId,
        fromUserId,
        toUserId,
        amountWon,
        recordedById: session.user.id,
      },
    });
  } catch (e) {
    logger.error({ err: e }, "record_member_payment_failed");
    return { ok: false, message: "지불을 기록할 수 없습니다." };
  }

  revalidatePath(`/app/groups/${groupId}`);
  return { ok: true, message: "지불을 기록했습니다." };
}

const deleteSchema = z.object({
  groupId: z.string().min(1),
  paymentId: z.string().min(1),
});

export async function deleteMemberPaymentFromForm(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const parsed = deleteSchema.safeParse({
    groupId: String(formData.get("groupId") ?? ""),
    paymentId: String(formData.get("paymentId") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false, message: "지불 정보가 올바르지 않습니다." };
  }

  const { groupId, paymentId } = parsed.data;

  const memberOk = await assertGroupMember(groupId, session.user.id);
  if (!memberOk) {
    return { ok: false, message: "이 그룹의 멤버가 아닙니다." };
  }

  const payment = await db.memberPayment.findFirst({
    where: { id: paymentId, groupId },
    include: { group: { select: { ownerId: true } } },
  });

  if (!payment) {
    return { ok: false, message: "기록을 찾을 수 없습니다." };
  }

  const uid = session.user.id;
  const canDelete =
    payment.group.ownerId === uid ||
    payment.recordedById === uid ||
    payment.fromUserId === uid ||
    payment.toUserId === uid;

  if (!canDelete) {
    return { ok: false, message: "이 기록을 삭제할 권한이 없습니다." };
  }

  try {
    await db.memberPayment.delete({ where: { id: paymentId } });
  } catch (e) {
    logger.error({ err: e }, "delete_member_payment_failed");
    return { ok: false, message: "기록을 삭제할 수 없습니다." };
  }

  revalidatePath(`/app/groups/${groupId}`);
  return { ok: true, message: "지불 기록을 삭제했습니다." };
}
