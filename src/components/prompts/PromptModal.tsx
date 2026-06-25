"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { fetchPromptDetail, PromptDetail, incrementCopyCount } from "@/actions/prompts";
import { RatingSection } from "@/components/rating/RatingSection";
import { Stage, Subject, SkillFocus, Grade } from "@prisma/client";
import clsx from "clsx";
import { useToast } from "@/components/ui/Toast";

const STAGE_LABELS: Record<Stage, string> = {
  DESIGN: "วิเคราะห์ & ออกแบบ",
  MATERIAL: "สร้างสื่อ & ใบงาน",
  FACILITATE: "จัดกิจกรรมในชั้นเรียน",
  ASSESS: "ประเมิน & ป้อนกลับ",
  REFLECT: "สะท้อนคิด & ต่อยอด",
};

const SUBJECT_LABELS: Record<Subject, string> = {
  THAI: "ภาษาไทย",
  SCIENCE: "วิทยาศาสตร์",
  SOCIAL: "สังคมศึกษา",
  CROSS: "ข้ามวิชา",
};

const GRADE_LABELS: Record<Grade, string> = {
  M1: "ม.1",
  M2: "ม.2",
  M3: "ม.3",
  M1_3: "ม.1–3",
};

const SKILL_CONFIG: Record<SkillFocus, { label: string; className: string }> = {
  RL:   { label: "RL",    className: "bg-rl-bg text-rl" },
  CT:   { label: "CT",    className: "bg-ct-bg text-ct" },
  BOTH: { label: "RL+CT", className: "bg-both-bg text-both" },
};

/** แยกส่วน [ตัวแปร] ออกมาเพื่อ highlight */
function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <span>
      {parts.map((part, i) =>
        /^\[.+\]$/.test(part) ? (
          <mark key={i} className="prompt-variable">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

interface PromptModalProps {
  promptId: string;
  onClose: () => void;
}

export function PromptModal({ promptId, onClose }: PromptModalProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [copyCount, setCopyCount] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchPromptDetail(promptId);
    setPrompt(data);
    setCopyCount(data?.copyCount ?? 0);
    setLoading(false);
  }, [promptId]);

  useEffect(() => {
    load();
  }, [load]);

  // ปิด modal เมื่อกด Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleCopy = async () => {
    if (!session?.user) {
      signIn("google");
      return;
    }
    if (!prompt) return;

    try {
      setCopying(true);
      await navigator.clipboard.writeText(prompt.text);
      const result = await incrementCopyCount(promptId);
      if (result.ok) {
        setCopyCount((c) => c + 1);
        showToast("คัดลอกพรอมต์แล้ว ✓", "success");
      }
    } catch {
      showToast("ไม่สามารถคัดลอกได้", "error");
    } finally {
      setCopying(false);
    }
  };

  const skill = prompt ? SKILL_CONFIG[prompt.skill] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-t-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              {prompt && (
                <span
                  className={clsx(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    skill!.className
                  )}
                >
                  {skill!.label}
                </span>
              )}
              {prompt && (
                <span className="text-xs text-gray-500">
                  {STAGE_LABELS[prompt.stage]}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="ปิด"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-40 bg-gray-100 rounded" />
              </div>
            ) : prompt ? (
              <>
                <h2 className="font-serif text-lg font-bold text-gray-800 leading-snug">
                  {prompt.title}
                </h2>

                {/* Meta */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {SUBJECT_LABELS[prompt.subject]}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {GRADE_LABELS[prompt.grade]}
                  </span>
                  {prompt.ratingCount > 0 && (
                    <span className="bg-gold/10 text-gold px-2 py-0.5 rounded-full">
                      ★ {prompt.avgRating!.toFixed(1)} ({prompt.ratingCount} คะแนน)
                    </span>
                  )}
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    คัดลอกแล้ว {copyCount} ครั้ง
                  </span>
                </div>

                {/* Prompt text */}
                <div className="bg-paper rounded-xl border border-paper-dark p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  <HighlightedText text={prompt.text} />
                </div>

                {/* Copy button */}
                {session?.user ? (
                  <button
                    onClick={handleCopy}
                    disabled={copying}
                    className="w-full bg-river hover:bg-river-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {copying ? "กำลังคัดลอก..." : "📋 คัดลอกพรอมต์"}
                  </button>
                ) : (
                  <button
                    onClick={() => signIn("google")}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 rounded-xl transition-colors text-sm"
                  >
                    เข้าสู่ระบบเพื่อคัดลอกพรอมต์
                  </button>
                )}

                {/* Rating section */}
                <RatingSection promptId={promptId} />
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">ไม่พบพรอมต์นี้</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
