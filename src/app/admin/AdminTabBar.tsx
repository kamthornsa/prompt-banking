"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/prompts", label: "จัดการพรอมต์", exact: false },
  { href: "/admin/admins", label: "ผู้ดูแล", exact: false },
  { href: "/admin/members", label: "สมาชิก", exact: false },
];

export function AdminTabBar() {
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 28, borderBottom: "1px solid #E7E3D9" }}>
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#0A6B4D" : "#6B7B78",
              borderBottom: isActive ? "2px solid #0E9E6E" : "2px solid transparent",
              marginBottom: -1,
              textDecoration: "none",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
