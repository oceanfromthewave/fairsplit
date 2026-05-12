"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";
import { auth } from "@/auth";
import { GroupRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const nameSchema = z.string().trim().min(1, "그룹 이름을 입력해 주세요.").max(80);

export type ActionState =
  | { ok: true; message?: string; groupId?: string }
  | { ok: false; message: string };

export async function createGroup(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "이름이 올바르지 않습니다." };
  }

  const inviteToken = nanoid(24);

  let newGroupId: string;
  try {
    const group = await db.group.create({
      data: {
        name: parsed.data,
        inviteToken,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: GroupRole.OWNER,
          },
        },
      },
      select: { id: true },
    });
    newGroupId = group.id;
  } catch (e) {
    logger.error({ err: e }, "create_group_failed");
    return { ok: false, message: "그룹을 만들 수 없습니다." };
  }

  revalidatePath("/app");
  return { ok: true, message: "그룹이 생성되었습니다.", groupId: newGroupId };
}

export async function joinGroupByToken(token: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const t = z.string().min(8).max(64).safeParse(token);
  if (!t.success) {
    return { ok: false, message: "초대 링크 형식이 올바르지 않습니다." };
  }

  const group = await db.group.findUnique({
    where: { inviteToken: t.data },
    select: { id: true },
  });

  if (!group) {
    return { ok: false, message: "유효하지 않은 초대 링크입니다." };
  }

  try {
    await db.groupMember.upsert({
      where: {
        groupId_userId: { groupId: group.id, userId: session.user.id },
      },
      create: {
        groupId: group.id,
        userId: session.user.id,
        role: GroupRole.MEMBER,
      },
      update: {},
    });
  } catch (e) {
    logger.error({ err: e }, "join_group_failed");
    return { ok: false, message: "그룹에 참여할 수 없습니다." };
  }

  revalidatePath("/app");
  revalidatePath(`/app/groups/${group.id}`);
  return { ok: true, message: "그룹에 참여했습니다.", groupId: group.id };
}

export async function leaveGroup(groupId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  });

  if (!group) {
    return { ok: false, message: "그룹을 찾을 수 없습니다." };
  }

  if (group.ownerId === session.user.id) {
    return {
      ok: false,
      message: "그룹 소유자는 나갈 수 없습니다. 대신 그룹을 삭제해 주세요.",
    };
  }

  try {
    await db.groupMember.deleteMany({
      where: { groupId, userId: session.user.id },
    });
  } catch (e) {
    logger.error({ err: e }, "leave_group_failed");
    return { ok: false, message: "그룹에서 나갈 수 없습니다." };
  }

  revalidatePath("/app");
  revalidatePath(`/app/groups/${groupId}`);
  return { ok: true, message: "그룹에서 나갔습니다." };
}

export async function deleteGroup(groupId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const group = await db.group.findFirst({
    where: { id: groupId, ownerId: session.user.id },
    select: { id: true },
  });

  if (!group) {
    return { ok: false, message: "그룹을 찾을 수 없거나 소유자가 아닙니다." };
  }

  try {
    await db.group.delete({ where: { id: groupId } });
  } catch (e) {
    logger.error({ err: e }, "delete_group_failed");
    return { ok: false, message: "그룹을 삭제할 수 없습니다." };
  }

  revalidatePath("/app");
  return { ok: true, message: "그룹이 삭제되었습니다." };
}

export async function deleteGroupFormAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const groupId = String(formData.get("groupId") ?? "");
  if (!groupId) return { ok: false, message: "그룹 정보가 없습니다." };
  return deleteGroup(groupId);
}

export async function leaveGroupFormAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const groupId = String(formData.get("groupId") ?? "");
  if (!groupId) return { ok: false, message: "그룹 정보가 없습니다." };
  return leaveGroup(groupId);
}
