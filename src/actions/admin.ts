"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Role, AuthorRequestStatus } from "@prisma/client";
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

export async function promoteToAuthor(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) return { ok: false, error: "ไม่พบผู้ใช้" };
  if (target.role === Role.ADMIN) return { ok: false, error: "ไม่สามารถเปลี่ยน role ของ ADMIN ได้" };

  await prisma.user.update({ where: { id: userId }, data: { role: Role.AUTHOR } });
  revalidatePath("/admin/members");
  return { ok: true };
}

export async function demoteAuthor(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) return { ok: false, error: "ไม่พบผู้ใช้" };
  if (target.role !== Role.AUTHOR) return { ok: false, error: "ผู้ใช้นี้ไม่ได้เป็น AUTHOR" };

  await prisma.user.update({ where: { id: userId }, data: { role: Role.USER } });
  revalidatePath("/admin/members");
  return { ok: true };
}

// ---- Author request flow ----

export async function requestAuthorRole(): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };
  if (session.user.role !== Role.USER) {
    return { ok: false, error: "เฉพาะสมาชิกทั่วไปเท่านั้นที่ขอสิทธิ์ได้" };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { authorRequestStatus: AuthorRequestStatus.PENDING },
  });
  revalidatePath("/admin/members");
  return { ok: true };
}

export async function approveAuthorRequest(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { authorRequestStatus: true } });
  if (!target) return { ok: false, error: "ไม่พบผู้ใช้" };

  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.AUTHOR, authorRequestStatus: null },
  });
  revalidatePath("/admin/members");
  return { ok: true };
}

export async function rejectAuthorRequest(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { authorRequestStatus: AuthorRequestStatus.REJECTED },
  });
  revalidatePath("/admin/members");
  return { ok: true };
}
