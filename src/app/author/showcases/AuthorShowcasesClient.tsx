"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteShowcaseButton } from "./DeleteShowcaseButton";

interface ShowcaseRow {
  id: string;
  title: string;
  type: string;
  isHidden: boolean;
  externalUrl: string | null;
  createdAt: Date;
  prompt: { id: string; title: string };
  _count: { ratings: number };
  avgRating?: number | null;
}

interface AuthorShowcasesClientProps {
  initialShowcases: ShowcaseRow[];
}

export function AuthorShowcasesClient({ initialShowcases }: AuthorShowcasesClientProps) {
  const [showcases, setShowcases] = useState(initialShowcases);

  const handleDeleted = (id: string) => {
    setShowcases((prev) => prev.filter((s) => s.id !== id));
  };

  if (showcases.length === 0) {
    return (
      <div
        className="py-16 text-center rounded-2xl"
        style={{ background: "#fff", border: "1px solid #E7E3D9", color: "#9AA6A3" }}
      >
        <p className="text-sm">ยังไม่มีผลงาน</p>
        <p className="text-xs mt-1">
          เปิดพรอมต์ใดก็ได้แล้วกด{" "}
          <strong>&quot;+ เพิ่มผลงาน&quot;</strong> เพื่อแชร์ผลงานของคุณ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showcases.map((s) => (
        <div
          key={s.id}
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "#fff",
            border: "1px solid #E7E3D9",
            opacity: s.isHidden ? 0.6 : 1,
          }}
        >
          {/* Type icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: "#F6F5F0" }}
          >
            🔗
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold truncate" style={{ color: "#18302D" }}>
                {s.title}
              </span>
              {s.isHidden && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: "#FBEFE0", color: "#B5772A" }}
                >
                  ถูกซ่อน
                </span>
              )}
              {s._count.ratings > 0 && (
                <span className="text-xs" style={{ color: "#C18C2A" }}>
                  ★ {s.avgRating?.toFixed(1)} ({s._count.ratings} คะแนน)
                </span>
              )}
            </div>

            <p className="text-xs truncate" style={{ color: "#6B7B78" }}>
              พรอมต์:{" "}
              <span style={{ color: "#0E5C53" }}>{s.prompt.title}</span>
            </p>

            {s.externalUrl && (
              <a
                href={s.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline truncate block mt-0.5"
                style={{ color: "#9AA6A3" }}
              >
                {s.externalUrl}
              </a>
            )}

            <p className="text-[11px] mt-1" style={{ color: "#B5C5C2" }}>
              {new Date(s.createdAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Actions */}
          <DeleteShowcaseButton id={s.id} onDeleted={() => handleDeleted(s.id)} />
        </div>
      ))}
    </div>
  );
}
