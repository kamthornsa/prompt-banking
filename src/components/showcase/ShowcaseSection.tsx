"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { Role } from "@prisma/client";
import { ShowcaseWithAuthor, fetchShowcasesByPrompt } from "@/actions/showcases";
import { ShowcaseCard } from "./ShowcaseCard";
import { ShowcaseForm } from "./ShowcaseForm";

interface ShowcaseSectionProps {
  promptId: string;
}

export function ShowcaseSection({ promptId }: ShowcaseSectionProps) {
  const { data: session } = useSession();
  const [showcases, setShowcases] = useState<ShowcaseWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const isAuthorOrAdmin =
    session?.user?.role === Role.AUTHOR || session?.user?.role === Role.ADMIN;

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchShowcasesByPrompt(promptId);
    setShowcases(data);
    setLoading(false);
  }, [promptId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreated = () => {
    setShowForm(false);
    load();
  };

  const handleDeleted = (id: string) => {
    setShowcases((prev) => prev.filter((s) => s.id !== id));
  };

  const handleHidden = (id: string, hidden: boolean) => {
    setShowcases((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isHidden: hidden } : s))
    );
  };

  const visibleCount = showcases.filter((s) => !s.isHidden).length;

  return (
    <section className="border-t border-gray-100 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          ตัวอย่างผลงานจากพรอมต์นี้{visibleCount > 0 ? ` (${visibleCount})` : ""}
        </h3>
        {isAuthorOrAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "#E2F4EC", color: "#0A6B4D" }}
          >
            + เพิ่มผลงาน
          </button>
        )}
        {!session?.user && (
          <button
            onClick={() => signIn("google")}
            className="text-xs underline underline-offset-2"
            style={{ color: "#6B7B78" }}
          >
            เข้าสู่ระบบเพื่อเพิ่มผลงาน
          </button>
        )}
      </div>

      {showForm && (
        <ShowcaseForm
          promptId={promptId}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : showcases.length === 0 ? (
        <p className="text-xs py-4 text-center" style={{ color: "#9AA6A3" }}>
          ยังไม่มีผลงานจากพรอมต์นี้ — เป็นคนแรกที่แชร์!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {showcases.map((s) => (
            <ShowcaseCard
              key={s.id}
              showcase={s}
              onDeleted={handleDeleted}
              onHidden={handleHidden}
            />
          ))}
        </div>
      )}
    </section>
  );
}
