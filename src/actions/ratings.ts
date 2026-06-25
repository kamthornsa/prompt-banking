"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";

// ---- Types ----

export interface RatingWithUser {
  id: string;
  value: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface RatingsData {
  ratings: RatingWithUser[];
  myRating: { value: number; comment: string | null } | null;
}

// ---- Fetch ratings for a prompt ----

export async function fetchRatings(promptId: string): Promise<RatingsData> {
  const session = await auth();

  const ratings = await prisma.rating.findMany({
    where: { promptId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      value: true,
      comment: true,
      isHidden: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, image: true } },
    },
  });

  const myRating = session?.user?.id
    ? (ratings.find((r) => r.user.id === session.user.id) ?? null)
    : null;

  return {
    ratings,
    myRating: myRating
      ? { value: myRating.value, comment: myRating.comment }
      : null,
  };
}

// ---- Upsert rating ----

const RatingSchema = z.object({
  promptId: z.string().min(1),
  value: z.number().int().min(1).max(5),
  comment: z.string().max(200).optional(),
});

export async function upsertRating(
  promptId: string,
  value: number,
  comment?: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const parsed = RatingSchema.safeParse({ promptId, value, comment });
  if (!parsed.success) return { ok: false, error: "ข้อมูลไม่ถูกต้อง" };

  await prisma.rating.upsert({
    where: { userId_promptId: { userId: session.user.id, promptId } },
    create: {
      userId: session.user.id,
      promptId,
      value,
      comment: comment ?? null,
    },
    update: {
      value,
      comment: comment ?? null,
    },
  });

  revalidatePath("/");
  return { ok: true };
}

// ---- Admin: hide/show rating comment ----

export async function hideRatingComment(
  ratingId: string,
  hide: boolean
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  if (session.user.role !== "ADMIN") return { ok: false };

  await prisma.rating.update({
    where: { id: ratingId },
    data: { isHidden: hide },
  });

  revalidatePath("/");
  return { ok: true };
}
