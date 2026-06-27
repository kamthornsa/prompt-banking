import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthorShowcasesClient } from "./AuthorShowcasesClient";
import { AuthorTabBar } from "../AuthorTabBar";

export default async function AuthorShowcasesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/?login=required");

  const showcases = await prisma.showcase.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      isHidden: true,
      externalUrl: true,
      createdAt: true,
      prompt: { select: { id: true, title: true } },
      _count: { select: { ratings: true } },
      ratings: { where: { isHidden: false }, select: { value: true } },
    },
  });

  const rows = showcases.map((s) => ({
    ...s,
    avgRating:
      s.ratings.length > 0
        ? s.ratings.reduce((acc, r) => acc + r.value, 0) / s.ratings.length
        : null,
    ratings: undefined,
  }));

  return (
    <div className="space-y-6">
      <AuthorTabBar />

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-serif font-bold text-[36px] leading-tight"
            style={{ color: "#18302D" }}
          >
            ผลงานของฉัน
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7B78" }}>
            ผลงานที่คุณแชร์ผ่านพรอมต์ต่าง ๆ — เพิ่มผลงานได้จากหน้าพรอมต์โดยตรง
          </p>
        </div>
      </div>

      {/* Info box */}
      <div
        className="p-4 rounded-xl text-sm"
        style={{ background: "#E5F0F7", color: "#246F95" }}
      >
        💡 วิธีเพิ่มผลงาน: เปิดพรอมต์ใดก็ได้จาก{" "}
        <Link href="/" className="font-semibold underline">
          หน้าหลัก
        </Link>{" "}
        แล้วเลื่อนลงไปที่ส่วน &quot;ตัวอย่างผลงาน&quot; → กด &quot;+ เพิ่มผลงาน&quot;
      </div>

      {/* Showcase list */}
      <AuthorShowcasesClient initialShowcases={rows} />
    </div>
  );
}
