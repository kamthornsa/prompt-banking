"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Stage, Subject, SkillFocus, Grade, Role, PromptStatus } from "@prisma/client";
import { PromptCardData } from "@/components/prompts/PromptCard";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";

// ---- Types ----

export interface FetchPromptsInput {
  stage?: Stage | "";
  subject?: Subject | "";
  grade?: Grade | "";
  skill?: SkillFocus | "";
  search?: string;
  sort?: "newest" | "rating" | "copies" | "showcases";
}

// ---- Fetch (used by server + client via server action) ----

export async function fetchPrompts(input: FetchPromptsInput): Promise<PromptCardData[]> {
  const rows = await prisma.prompt.findMany({
    where: {
      status: PromptStatus.PUBLISHED,
      ...(input.stage && { stage: input.stage }),
      ...(input.subject && { subject: input.subject }),
      ...(input.grade && { grade: input.grade }),
      ...(input.skill && { skill: input.skill }),
      ...(input.search && {
        OR: [
          { title: { contains: input.search, mode: "insensitive" } },
          { text: { contains: input.search, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      title: true,
      text: true,
      stage: true,
      subject: true,
      skill: true,
      grade: true,
      copyCount: true,
      ratings: { select: { value: true } },
      showcases: { select: { id: true }, where: { isHidden: false } },
    },
    orderBy:
      input.sort === "copies"
        ? { copyCount: "desc" }
        : input.sort === "showcases"
        ? { showcases: { _count: "desc" } }
        : { createdAt: "desc" },
  });

  const prompts: PromptCardData[] = rows.map((row) => {
    const count = row.ratings.length;
    const sum = row.ratings.reduce((a, r) => a + r.value, 0);
    const raw = row.text.replace(/\s+/g, " ").trim();
    const excerpt = raw.length > 110 ? raw.substring(0, 110) + "…" : raw;
    return {
      id: row.id,
      title: row.title,
      excerpt,
      stage: row.stage,
      subject: row.subject,
      skill: row.skill,
      grade: row.grade,
      copyCount: row.copyCount,
      avgRating: count > 0 ? sum / count : null,
      ratingCount: count,
      showcaseCount: row.showcases.length,
    };
  });

  if (input.sort === "rating") {
    prompts.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
  }
  return prompts;
}

// ---- Fetch single prompt detail ----

export interface PromptDetail {
  id: string;
  title: string;
  text: string;
  stage: Stage;
  subject: Subject;
  skill: SkillFocus;
  grade: Grade;
  copyCount: number;
  avgRating: number | null;
  ratingCount: number;
  createdAt: Date;
}

export async function fetchPromptDetail(id: string): Promise<PromptDetail | null> {
  const row = await prisma.prompt.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      text: true,
      stage: true,
      subject: true,
      skill: true,
      grade: true,
      copyCount: true,
      createdAt: true,
      ratings: { select: { value: true } },
    },
  });
  if (!row) return null;
  const count = row.ratings.length;
  const sum = row.ratings.reduce((a, r) => a + r.value, 0);
  return {
    ...row,
    avgRating: count > 0 ? sum / count : null,
    ratingCount: count,
  };
}

// ---- Increment copy count ----

export async function incrementCopyCount(promptId: string): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  await prisma.prompt.update({
    where: { id: promptId },
    data: { copyCount: { increment: 1 } },
  });
  return { ok: true };
}

// ---- Author: fetch own prompts ----

export interface AuthorPromptRow {
  id: string;
  title: string;
  stage: Stage;
  subject: Subject;
  grade: Grade;
  status: PromptStatus;
  createdAt: Date;
  copyCount: number;
  avgRating: number | null;
  ratingCount: number;
}

export async function fetchAuthorPrompts(): Promise<AuthorPromptRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== Role.AUTHOR && session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
  const rows = await prisma.prompt.findMany({
    where: { createdById: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, stage: true, subject: true, grade: true,
      status: true, createdAt: true, copyCount: true,
      ratings: { select: { value: true } },
    },
  });
  return rows.map((row) => {
    const vals = row.ratings.map((r) => r.value);
    const avgRating =
      vals.length > 0
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        : null;
    const { ratings: _r, ...rest } = row;
    return { ...rest, avgRating, ratingCount: vals.length };
  });
}

// ---- Admin: CRUD ----

const PromptSchema = z.object({
  title: z.string().min(3).max(200),
  text: z.string().min(10),
  stage: z.enum(["DESIGN", "MATERIAL", "FACILITATE", "ASSESS", "REFLECT"]),
  subject: z.enum(["THAI", "SCIENCE", "SOCIAL", "CROSS"]),
  skill: z.enum(["RL", "CT", "BOTH"]),
  grade: z.enum(["M1", "M2", "M3", "M1_3"]),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== Role.ADMIN) throw new Error("Forbidden");
  return session.user.id;
}

async function requireAuthorOrAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const role = session.user.role as Role;
  if (role !== Role.AUTHOR && role !== Role.ADMIN) throw new Error("Forbidden");
  return { userId: session.user.id, role };
}

export async function createPrompt(data: z.infer<typeof PromptSchema>) {
  const { userId } = await requireAuthorOrAdmin();
  const parsed = PromptSchema.parse(data);
  await prisma.prompt.create({
    data: { ...parsed, createdById: userId, status: PromptStatus.PUBLISHED },
  });
  revalidatePath("/");
  revalidatePath("/admin/prompts");
  revalidatePath("/author/prompts");
}

export async function updatePrompt(id: string, data: z.infer<typeof PromptSchema>) {
  const { userId, role } = await requireAuthorOrAdmin();
  const parsed = PromptSchema.parse(data);

  if (role === Role.AUTHOR) {
    const existing = await prisma.prompt.findUnique({ where: { id }, select: { createdById: true } });
    if (!existing) throw new Error("ไม่พบพรอมต์");
    if (existing.createdById !== userId) throw new Error("Forbidden");
  }
  await prisma.prompt.update({ where: { id }, data: parsed });

  revalidatePath("/");
  revalidatePath("/admin/prompts");
  revalidatePath("/author/prompts");
}

export async function deletePrompt(id: string) {
  const { userId, role } = await requireAuthorOrAdmin();

  if (role === Role.AUTHOR) {
    const existing = await prisma.prompt.findUnique({ where: { id }, select: { createdById: true } });
    if (!existing) throw new Error("ไม่พบพรอมต์");
    if (existing.createdById !== userId) throw new Error("Forbidden");
  }

  await prisma.prompt.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/prompts");
  revalidatePath("/author/prompts");
}

export async function approvePrompt(id: string) {
  await requireAdmin();
  await prisma.prompt.update({ where: { id }, data: { status: PromptStatus.PUBLISHED } });
  revalidatePath("/");
  revalidatePath("/admin/prompts");
  revalidatePath("/author/prompts");
}

export async function rejectPrompt(id: string) {
  await requireAdmin();
  await prisma.prompt.update({ where: { id }, data: { status: PromptStatus.REJECTED } });
  revalidatePath("/admin/prompts");
  revalidatePath("/author/prompts");
}
