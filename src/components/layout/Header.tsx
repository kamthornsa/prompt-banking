"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role, AuthorRequestStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestAuthorRole } from "@/actions/admin";

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user.role === Role.ADMIN;
  const isAuthor = session?.user.role === Role.AUTHOR;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(246, 245, 240, 0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid #E7E3D9",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-6 py-[13px] flex items-center gap-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[11px] shrink-0">
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "#0E9E6E",
              boxShadow: "0 4px 10px rgba(14,158,110,0.28)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2.5"
                strokeDasharray="22 44" strokeLinecap="round" />
              <circle cx="9" cy="9" r="3" fill="white" />
            </svg>
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="font-serif font-bold text-[18px] tracking-[0.2px]" style={{ color: "#18302D" }}>
              CARIA
            </span>
            <span className="text-[11px] font-medium" style={{ color: "#9AA6A3" }}>
              ธนาคารพรอมต์ครู
            </span>
          </span>
        </Link>

        {/* Center nav */}
        <nav className="flex gap-[3px] ml-1.5">
          <NavLink href="/" active={pathname === "/"}>หน้าหลัก</NavLink>
          {(isAuthor || isAdmin) && (
            <NavLink href="/author/prompts" active={pathname.startsWith("/author")}>พื้นที่ผู้เขียน</NavLink>
          )}
          {isAdmin && (
            <NavLink href="/admin" active={pathname.startsWith("/admin")}>ผู้ดูแล</NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {session?.user.role === Role.USER && (
            <AuthorRequestButton status={session.user.authorRequestStatus} />
          )}

          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-[10px]">
              <div className="hidden sm:block text-right leading-[1.25]">
                <div className="text-[13.5px] font-semibold" style={{ color: "#18302D" }}>
                  {session.user.name}
                </div>
                <div className="text-[11px]" style={{ color: "#9AA6A3" }}>
                  {session.user.role === Role.ADMIN ? "แอดมิน"
                    : session.user.role === Role.AUTHOR ? "ผู้เขียน"
                    : "สมาชิก"}
                </div>
              </div>
              {session.user.image ? (
                <UserDropdown user={session.user} />
              ) : (
                <UserDropdown user={session.user} />
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: window.location.href })}              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all"
              style={{ background: "#0E9E6E", color: "#fff", boxShadow: "0 2px 8px rgba(14,158,110,0.25)" }}
            >
              <GoogleIcon />
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-[14px] py-[8px] rounded-[10px] text-sm font-semibold transition-colors"
      style={active ? { background: "#E2F4EC", color: "#0A6B4D" } : { background: "transparent", color: "#6B7B78" }}
    >
      {children}
    </Link>
  );
}

function AuthorRequestButton({ status }: { status: AuthorRequestStatus | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(status);

  const handleRequest = () => {
    startTransition(async () => {
      const result = await requestAuthorRole();
      if (result.ok) {
        setLocalStatus(AuthorRequestStatus.PENDING);
        router.refresh();
      }
    });
  };

  if (localStatus === AuthorRequestStatus.PENDING) {
    return (
      <span className="hidden sm:inline text-xs font-medium px-3 py-1.5 rounded-full"
        style={{ background: "#FBEFE0", color: "#B5772A" }}>
        ⏳ รอการอนุมัติ
      </span>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={isPending}
      className="hidden sm:inline text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:opacity-50"
      style={{ border: "1px solid #E7E3D9", color: "#6B7B78" }}
    >
      {isPending ? "กำลังส่ง..."
        : localStatus === AuthorRequestStatus.REJECTED ? "ขอสิทธิ์ผู้เขียนใหม่"
        : "ขอสิทธิ์ผู้เขียน"}
    </button>
  );
}

function UserDropdown({ user }: {
  user: { name?: string | null; image?: string | null; slug: string | null };
}) {
  const [open, setOpen] = useState(false);

  const avatar = user.image ? (
    <Image
      src={user.image}
      alt={user.name ?? ""}
      width={34}
      height={34}
      className="rounded-full ring-2 ring-[#E7E3D9] hover:ring-river transition-all"
    />
  ) : (
    <div
      className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-bold text-sm"
      style={{ background: "#0E9E6E" }}
    >
      {(user.name ?? "?")[0].toUpperCase()}
    </div>
  );

  return (
    <div className="relative">
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
      <button onClick={() => setOpen((o) => !o)} className="shrink-0">
        {avatar}
      </button>
      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-44 rounded-xl shadow-lg overflow-hidden py-1"
          style={{ background: "#fff", border: "1px solid #E7E3D9" }}
        >
          {user.slug && (
            <Link
              href={`/u/${user.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[#F6F5F0]"
              style={{ color: "#18302D" }}
            >
              👤 โปรไฟล์ของฉัน
            </Link>
          )}
          <Link
            href="/settings/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[#F6F5F0]"
            style={{ color: "#18302D" }}
          >
            ⚙️ ตั้งค่าโปรไฟล์
          </Link>
          <div style={{ height: 1, background: "#E7E3D9", margin: "4px 0" }} />
          <button
            onClick={() => signOut({ callbackUrl: window.location.href })}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
            style={{ color: "#B54B2C" }}
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
