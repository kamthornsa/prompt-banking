"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { TeachingSubject, Role } from "@prisma/client";
import { RESERVED_SLUGS } from "@/lib/constants";

// ---- Types ----

export interface UserProfile {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  slug: string | null;
  bio: string | null;
  school: string | null;
  teachingSubjects: TeachingSubject[];
  role: Role;
}

export interface PublicProfileShowcase {
  id: string;
  title: string;
  type: string;
  externalUrl: string | null;
  createdAt: Date;
  prompt: { id: string; title: string };
  _count: { ratings: number };
  avgRating: number | null;
}

export interface PublicProfile {
  id: string;
  name: string | null;
  image: string | null;
  slug: string;
  bio: string | null;
  school: string | null;
  teachingSubjects: TeachingSubject[];
  role: Role;
  createdAt: Date;
  promptsCreated: {
    id: string;
    title: string;
    stage: string;
    subject: string;
    skill: string;
    grade: string;
    copyCount: number;
    createdAt: Date;
  }[];
  showcases: PublicProfileShowcase[];
}

// ---- Fetch my profile ----

export async function fetchMyProfile(): Promise<UserProfile | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      slug: true,
      bio: true,
      school: true,
      teachingSubjects: true,
      role: true,
    },
  });
}

// ---- Fetch public profile ----

export async function fetchPublicProfile(slug: string): Promise<PublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      image: true,
      slug: true,
      bio: true,
      school: true,
      teachingSubjects: true,
      role: true,
      createdAt: true,
      promptsCreated: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          title: true,
          stage: true,
          subject: true,
          skill: true,
          grade: true,
          copyCount: true,
          createdAt: true,
        },
      },
      showcases: {
        where: { isHidden: false },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          externalUrl: true,
          createdAt: true,
          prompt: { select: { id: true, title: true } },
          _count: { select: { ratings: true } },
          ratings: {
            where: { isHidden: false },
            select: { value: true },
          },
        },
      },
    },
  });

  if (!user?.slug) return null;

  // Compute avgRating for showcases
  const showcases = (user.showcases ?? []).map((s) => {
    const avgRating =
      s.ratings.length > 0
        ? s.ratings.reduce((acc: number, r: { value: number }) => acc + r.value, 0) / s.ratings.length
        : null;
    const { ratings: _r, ...rest } = s;
    return { ...rest, avgRating };
  });

  return { ...(user as Omit<typeof user, "showcases">), showcases } as PublicProfile;
}

// ---- Update profile ----

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const ProfileSchema = z.object({
  slug: z
    .string()
    .max(30, "ไม่เกิน 30 ตัวอักษร")
    .refine(
      (s) => s === "" || (s.length >= 2 && SLUG_REGEX.test(s)),
      "ใช้ได้แค่ a-z, 0-9 และขีด (-) ห้ามขึ้น/ลงท้ายด้วยขีด"
    )
    .optional(),
  bio: z.string().max(300, "ไม่เกิน 300 ตัวอักษร").optional(),
  school: z.string().max(200, "ไม่เกิน 200 ตัวอักษร").optional(),
  teachingSubjects: z.array(z.string()).optional(),
});

export async function updateProfile(
  input: unknown
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const cleanSlug = parsed.data.slug?.trim() || null;

  if (cleanSlug) {
    if (RESERVED_SLUGS.includes(cleanSlug))
      return { ok: false, error: "ชื่อ URL นี้ถูกสงวนไว้ กรุณาเลือกอื่น" };

    const existing = await prisma.user.findUnique({ where: { slug: cleanSlug } });
    if (existing && existing.id !== session.user.id)
      return { ok: false, error: "ชื่อ URL นี้ถูกใช้แล้ว กรุณาเลือกอื่น" };
  }

  const validSubjects = Object.values(TeachingSubject);
  const teachingSubjects = (parsed.data.teachingSubjects ?? []).filter(
    (s): s is TeachingSubject => validSubjects.includes(s as TeachingSubject)
  );

  const oldUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { slug: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      slug: cleanSlug,
      bio: parsed.data.bio?.trim() || null,
      school: parsed.data.school?.trim() || null,
      teachingSubjects,
    },
  });

  revalidatePath("/settings/profile");
  if (oldUser?.slug) revalidatePath(`/u/${oldUser.slug}`);
  if (cleanSlug) revalidatePath(`/u/${cleanSlug}`);

  return { ok: true };
}

// ---- Auto-generate slug suggestion (server) ----

export async function generateUniqueSlug(name: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 25) || "user";

  const safeBase = base.length >= 2 ? base : "user";
  let slug = safeBase;
  let counter = 1;
  for (let i = 0; i < 999; i++) {
    const existing = await prisma.user.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${safeBase.slice(0, 22)}-${counter}`;
    counter++;
  }
  return `user-${Date.now().toString(36)}`.slice(0, 30);
}
