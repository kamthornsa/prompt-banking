import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { SEED_ADMIN_EMAILS } from "@/lib/constants";
import { Role, AuthorRequestStatus } from "@prisma/client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// ขยาย Session type ให้มี id, role, slug
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      authorRequestStatus: AuthorRequestStatus | null;
      slug: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    authorRequestStatus: AuthorRequestStatus | null;
    slug: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: `${basePath}/api/auth`,
  adapter: PrismaAdapter(prisma),
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    // ส่ง id + role เข้า session ทุกครั้ง
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: (user as { role: Role }).role ?? Role.USER,
        authorRequestStatus:
          (user as { authorRequestStatus: AuthorRequestStatus | null }).authorRequestStatus ?? null,
        slug: (user as { slug: string | null }).slug ?? null,
      },
    }),
  },

  events: {
    signIn: async ({ user, isNewUser }) => {
      if (!user.id || !user.email) return;

      const tasks: Promise<unknown>[] = [
        // บันทึก login log ทุกครั้ง
        prisma.loginLog.create({ data: { userId: user.id } }),
        // อัปเดต lastLoginAt
        prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }),
      ];

      // ผู้ใช้ใหม่ที่อยู่ใน allowlist → ยกระดับเป็น ADMIN
      if (isNewUser && SEED_ADMIN_EMAILS.includes(user.email)) {
        tasks.push(
          prisma.user.update({
            where: { id: user.id },
            data: { role: Role.ADMIN },
          })
        );
      }

      await Promise.all(tasks);
    },
  },
});
