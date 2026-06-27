"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

// ---- Types ----

export interface ShowcaseRatingWithUser {
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

export interface ShowcaseRatingsData {
  ratings: ShowcaseRatingWithUser[];
  myRating: { value: number; comment: string | null } | null;
  avgRating: number | null;
}

// ---- Fetch ratings for a showcase ----

export async function fetchShowcaseRatings(
  showcaseId: string
): Promise<ShowcaseRatingsData> {
  const session = await auth();

  const ratings = await prisma.showcaseRating.findMany({
    where: { showcaseId },
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

  const visibleForAvg = ratings.filter((r) => !r.isHidden);
  const avgRating =
    visibleForAvg.length > 0
      ? visibleForAvg.reduce((acc, r) => acc + r.value, 0) / visibleForAvg.length
      : null;

  return {
    ratings,
    myRating: myRating
      ? { value: myRating.value, comment: myRating.comment }
      : null,
    avgRating,
  };
}

// ---- Upsert showcase rating ----

const RatingSchema = z.object({
  showcaseId: z.string().min(1),
  value: z.number().int().min(1).max(5),
  comment: z.string().max(200).optional(),
});

export async function upsertShowcaseRating(
  showcaseId: string,
  value: number,
  comment?: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const parsed = RatingSchema.safeParse({ showcaseId, value, comment });
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.showcaseRating.upsert({
    where: {
      userId_showcaseId: {
        userId: session.user.id,
        showcaseId,
      },
    },
    create: {
      userId: session.user.id,
      showcaseId,
      value,
      comment: comment?.trim() || null,
    },
    update: {
      value,
      comment: comment?.trim() || null,
    },
  });

  revalidatePath("/");
  return { ok: true };
}

// ---- Admin: hide/show showcase rating comment ----

export async function hideShowcaseRatingComment(
  ratingId: string,
  hide: boolean
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN)
    return { ok: false, error: "เฉพาะผู้ดูแลเท่านั้น" };

  await prisma.showcaseRating.update({
    where: { id: ratingId },
    data: { isHidden: hide },
  });
  return { ok: true };
}
