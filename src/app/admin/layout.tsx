import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/?login=required");
  if (session.user.role !== Role.ADMIN) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin top bar */}
      <header className="bg-river-dark text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gold font-serif font-bold text-base">
            CARIA
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-sm text-white/80">จัดการระบบ</span>
        </div>
        <Link href="/" className="text-xs text-white/60 hover:text-white transition-colors">
          ← กลับหน้าหลัก
        </Link>
      </header>

      <div className="flex min-h-[calc(100vh-49px)]">
        {/* Sidebar */}
        <nav className="w-48 bg-white border-r border-gray-200 py-4 shrink-0 hidden sm:block">
          <NavLink href="/admin">
            📊 Dashboard
          </NavLink>
          <NavLink href="/admin/prompts">📝 จัดการพรอมต์</NavLink>
          <NavLink href="/admin/admins">🔑 ผู้ดูแลระบบ</NavLink>
          <NavLink href="/admin/members">👥 สมาชิก</NavLink>
        </nav>

        {/* Mobile nav */}
        <div className="sm:hidden w-full bg-white border-b border-gray-200 flex overflow-x-auto">
          <MobileNavLink href="/admin">Dashboard</MobileNavLink>
          <MobileNavLink href="/admin/prompts">พรอมต์</MobileNavLink>
          <MobileNavLink href="/admin/admins">ผู้ดูแล</MobileNavLink>
          <MobileNavLink href="/admin/members">สมาชิก</MobileNavLink>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-paper hover:text-river transition-colors font-medium"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 px-4 py-3 text-sm text-gray-700 hover:bg-paper hover:text-river font-medium"
    >
      {children}
    </Link>
  );
}
