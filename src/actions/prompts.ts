"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Stage, Subject, SkillFocus, Grade } from "@prisma/client";
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
  sort?: "newest" | "rating" | "copies";
}

// ---- Fetch (used by server + client via server action) ----

export async function fetchPrompts(input: FetchPromptsInput): Promise<PromptCardData[]> {
  const rows = await prisma.prompt.findMany({
    where: {
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
      stage: true,
      subject: true,
      skill: true,
      grade: true,
      copyCount: true,
      ratings: { select: { value: true } },
    },
    orderBy:
      input.sort === "copies"
        ? { copyCount: "desc" }
        : { createdAt: "desc" },
  });

  const prompts: PromptCardData[] = rows.map((row) => {
    const count = row.ratings.length;
    const sum = row.ratings.reduce((a, r) => a + r.value, 0);
    return {
      id: row.id,
      title: row.title,
      stage: row.stage,
      subject: row.subject,
      skill: row.skill,
      grade: row.grade,
      copyCount: row.copyCount,
      avgRating: count > 0 ? sum / count : null,
      ratingCount: count,
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
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session.user.id;
}

export async function createPrompt(data: z.infer<typeof PromptSchema>) {
  const adminId = await requireAdmin();
  const parsed = PromptSchema.parse(data);
  await prisma.prompt.create({
    data: { ...parsed, createdById: adminId },
  });
  revalidatePath("/");
  revalidatePath("/admin/prompts");
}

export async function updatePrompt(id: string, data: z.infer<typeof PromptSchema>) {
  await requireAdmin();
  const parsed = PromptSchema.parse(data);
  await prisma.prompt.update({ where: { id }, data: parsed });
  revalidatePath("/");
  revalidatePath("/admin/prompts");
}

export async function deletePrompt(id: string) {
  await requireAdmin();
  await prisma.prompt.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/prompts");
}
