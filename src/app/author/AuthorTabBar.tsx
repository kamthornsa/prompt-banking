"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/author/prompts", label: "พรอมต์", icon: "📝" },
  { href: "/author/showcases", label: "ผลงาน", icon: "🔗" },
];

export function AuthorTabBar() {
  const pathname = usePathname();

  return (
    <div
      className="flex gap-1 p-1 rounded-xl w-fit mb-6"
      style={{ background: "#E7E3D9" }}
    >
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              isActive
                ? {
                    background: "#fff",
                    color: "#0E5C53",
                    boxShadow: "0 1px 3px rgba(0,0,0,.1)",
                    textDecoration: "none",
                  }
                : { color: "#6B7B78", textDecoration: "none" }
            }
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
