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
    { label: "พรอมต์ทั้งหมด", value: promptCount, icon: "📝", href: "/admin/prompts" },
    { label: "สมาชิกทั้งหมด", value: userCount, icon: "👥", href: "/admin/members" },
    { label: "การให้คะแนน", value: ratingCount, icon: "★", href: "/admin/members" },
    { label: "เข้าระบบ (7 วัน)", value: recentLogins, icon: "🔐", href: "/admin/members" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-serif font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-river/40 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-river">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link
          href="/admin/prompts/new"
          className="bg-river hover:bg-river-dark text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          + เพิ่มพรอมต์ใหม่
        </Link>
        <Link
          href="/admin/prompts"
          className="bg-white hover:bg-paper text-river font-medium px-5 py-2.5 rounded-lg border border-river transition-colors text-sm"
        >
          จัดการพรอมต์ทั้งหมด
        </Link>
      </div>
    </div>
  );
}
