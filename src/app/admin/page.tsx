import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [promptCount, userCount, ratingCount, recentLogins] = await Promise.all([
    prisma.prompt.count(),
    prisma.user.count(),
    prisma.rating.count(),
    prisma.loginLog.count({
      where: { loginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const stats = [
    { label: "พรอมต์ทั้งหมด", value: promptCount, href: "/admin/prompts" },
    { label: "สมาชิกทั้งหมด", value: userCount, href: "/admin/members" },
    { label: "การให้คะแนน", value: ratingCount, href: "/admin/members" },
    { label: "เข้าระบบ (7 วัน)", value: recentLogins, href: "/admin/members", accent: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span
          style={{ background: "#E2F4EC", color: "#0A6B4D", fontSize: 13, fontWeight: 600,
            borderRadius: 99, padding: "3px 12px", display: "inline-block", marginBottom: 10 }}
        >
          พื้นที่ผู้ดูแล
        </span>
        <h1 className="font-serif font-bold text-[36px] leading-tight" style={{ color: "#18302D" }}>
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            style={{ background: "#fff", border: "1px solid #E7E3D9", borderRadius: 16,
              padding: "20px 24px", textDecoration: "none", display: "block" }}
          >
            <div
              className="font-serif font-bold text-[32px]"
              style={{ color: s.accent ? "#0E9E6E" : "#18302D", lineHeight: 1, marginBottom: 8 }}
            >
              {s.value}
            </div>
            <div className="text-sm" style={{ color: "#6B7B78" }}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link
          href="/admin/prompts/new"
          style={{ background: "#0E9E6E", color: "#fff", borderRadius: 12, padding: "10px 20px",
            fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block" }}
        >
          + เพิ่มพรอมต์ใหม่
        </Link>
        <Link
          href="/admin/prompts"
          style={{ background: "#fff", color: "#18302D", borderRadius: 12, padding: "10px 20px",
            fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block",
            border: "1px solid #E7E3D9" }}
        >
          จัดการพรอมต์ทั้งหมด
        </Link>
      </div>
    </div>
  );
}
