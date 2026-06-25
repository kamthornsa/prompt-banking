"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { PROTECTED_ADMIN_EMAIL } from "@/lib/constants";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== Role.ADMIN) throw new Error("Forbidden");
  return session.user.id;
}

export async function promoteToAdmin(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!target) return { ok: false, error: "ไม่พบผู้ใช้" };

  await prisma.user.update({ where: { id: userId }, data: { role: Role.ADMIN } });
  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function demoteAdmin(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!target) return { ok: false, error: "ไม่พบผู้ใช้" };
  if (target.email === PROTECTED_ADMIN_EMAIL) {
    return { ok: false, error: "ไม่สามารถลดสิทธิ์ seed admin ได้" };
  }

  await prisma.user.update({ where: { id: userId }, data: { role: Role.USER } });
  revalidatePath("/admin/admins");
  return { ok: true };
}
