"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

// ---- Types ----

export interface ShowcaseWithAuthor {
  id: string;
  title: string;
  description: string | null;
  type: string;
  externalUrl: string | null;
  isHidden: boolean;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    slug: string | null;
  };
  _count: {
    ratings: number;
  };
  avgRating?: number | null;
}

// ---- Fetch showcases for a prompt ----

export async function fetchShowcasesByPrompt(
  promptId: string
): Promise<ShowcaseWithAuthor[]> {
  const session = await auth();
  const isAdmin = session?.user?.role === Role.ADMIN;

  const showcases = await prisma.showcase.findMany({
    where: {
      promptId,
      ...(isAdmin ? {} : { isHidden: false }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      externalUrl: true,
      isHidden: true,
      createdAt: true,
      author: {
        select: { id: true, name: true, image: true, slug: true },
      },
      _count: { select: { ratings: true } },
      ratings: {
        where: { isHidden: false },
        select: { value: true },
      },
    },
  });

  return showcases.map((s) => {
    const avgRating =
      s.ratings.length > 0
        ? s.ratings.reduce((acc, r) => acc + r.value, 0) / s.ratings.length
        : null;
    const { ratings: _ratings, ...rest } = s;
    return { ...rest, avgRating };
  });
}

// ---- Fetch author's own showcases ----

export async function fetchAuthorShowcases(): Promise<ShowcaseWithAuthor[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const showcases = await prisma.showcase.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      externalUrl: true,
      isHidden: true,
      createdAt: true,
      author: {
        select: { id: true, name: true, image: true, slug: true },
      },
      _count: { select: { ratings: true } },
      ratings: {
        where: { isHidden: false },
        select: { value: true },
      },
      prompt: { select: { id: true, title: true, status: true } },
    },
  });

  return showcases.map((s) => {
    const avgRating =
      s.ratings.length > 0
        ? s.ratings.reduce((acc, r) => acc + r.value, 0) / s.ratings.length
        : null;
    const { ratings: _r, ...rest } = s;
    return { ...rest, avgRating } as ShowcaseWithAuthor & {
      prompt: { id: string; title: string; status: string };
    };
  });
}

// ---- Schemas ----

const URL_REGEX =
  /^https:\/\/(drive\.google\.com|docs\.google\.com|slides\.google\.com|canva\.com|www\.canva\.com|onedrive\.live\.com|sharepoint\.com|1drv\.ms|chat\.openai\.com|chatgpt\.com|gemini\.google\.com|aistudio\.google\.com|claude\.ai|notebooklm\.google\.com).*/;

const CreateShowcaseSchema = z.object({
  promptId: z.string().min(1),
  title: z.string().min(1, "กรุณาใส่ชื่อผลงาน").max(200),
  description: z.string().max(300).optional(),
  externalUrl: z.string().min(1, "กรุณาใส่ลิงก์"),
});

// ---- Create showcase ----

export async function createShowcase(
  input: unknown
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };
  if (session.user.role !== Role.AUTHOR && session.user.role !== Role.ADMIN) {
    return { ok: false, error: "เฉพาะผู้เขียนและผู้ดูแลเท่านั้น" };
  }

  const parsed = CreateShowcaseSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const { promptId, title, description, externalUrl } = parsed.data;

  // Verify prompt is PUBLISHED
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { status: true },
  });
  if (!prompt || prompt.status !== "PUBLISHED") {
    return { ok: false, error: "สามารถเพิ่มผลงานได้เฉพาะพรอมต์ที่เผยแพร่แล้ว" };
  }

  if (!URL_REGEX.test(externalUrl)) {
    return {
      ok: false,
      error: "รองรับเฉพาะลิงก์จาก Google Drive, Canva, OneDrive, ChatGPT, Gemini, Claude, NotebookLM",
    };
  }

  const showcase = await prisma.showcase.create({
    data: {
      promptId,
      authorId: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      type: "LINK",
      externalUrl,
    },
  });

  revalidatePath("/");
  return { ok: true, id: showcase.id };
}

// ---- Delete showcase ----

export async function deleteShowcase(
  showcaseId: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const showcase = await prisma.showcase.findUnique({
    where: { id: showcaseId },
    select: { authorId: true },
  });
  if (!showcase) return { ok: false, error: "ไม่พบผลงานนี้" };

  // Author can delete own, Admin can delete any
  if (
    showcase.authorId !== session.user.id &&
    session.user.role !== Role.ADMIN
  ) {
    return { ok: false, error: "ไม่มีสิทธิ์ลบผลงานนี้" };
  }

  await prisma.showcase.delete({ where: { id: showcaseId } });
  revalidatePath("/");
  return { ok: true };
}

// ---- Admin: hide/show showcase ----

export async function hideShowcase(
  showcaseId: string,
  hide: boolean
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return { ok: false, error: "เฉพาะผู้ดูแล" };

  await prisma.showcase.update({
    where: { id: showcaseId },
    data: { isHidden: hide },
  });
  return { ok: true };
}
