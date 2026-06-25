"use client";

import { Stage, Subject, SkillFocus, Grade } from "@prisma/client";
import clsx from "clsx";

export interface PromptCardData {
  id: string;
  title: string;
  stage: Stage;
  subject: Subject;
  skill: SkillFocus;
  grade: Grade;
  copyCount: number;
  avgRating: number | null;
  ratingCount: number;
}

const STAGE_LABELS: Record<Stage, string> = {
  DESIGN: "วิเคราะห์ & ออกแบบ",
  MATERIAL: "สร้างสื่อ & ใบงาน",
  FACILITATE: "จัดกิจกรรมในชั้นเรียน",
  ASSESS: "ประเมิน & ป้อนกลับ",
  REFLECT: "สะท้อนคิด & ต่อยอด",
};

const STAGE_COLORS: Record<Stage, string> = {
  DESIGN: "bg-[#0369a1]/10 text-[#0369a1]",
  MATERIAL: "bg-[#0891b2]/10 text-[#0891b2]",
  FACILITATE: "bg-[#0d9488]/10 text-[#0d9488]",
  ASSESS: "bg-[#65a30d]/10 text-[#65a30d]",
  REFLECT: "bg-[#d97706]/10 text-[#d97706]",
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

interface PromptCardProps {
  prompt: PromptCardData;
  onClick: (id: string) => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const skill = SKILL_CONFIG[prompt.skill];

  return (
    <button
      onClick={() => onClick(prompt.id)}
      className="group text-left w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-river/40 transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Stage strip */}
      <div className={clsx("px-4 py-1.5 text-xs font-medium", STAGE_COLORS[prompt.stage])}>
        {STAGE_LABELS[prompt.stage]}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <h3 className="font-serif font-semibold text-gray-800 text-sm leading-snug line-clamp-3 group-hover:text-river transition-colors">
          {prompt.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", skill.className)}>
            {skill.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {SUBJECT_LABELS[prompt.subject]}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {GRADE_LABELS[prompt.grade]}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-end gap-3 text-xs text-gray-400 border-t border-gray-100 pt-2">
          {prompt.ratingCount > 0 ? (
            <span className="flex items-center gap-1">
              <span className="text-gold">★</span>
              <span className="font-medium text-gray-600">
                {prompt.avgRating!.toFixed(1)}
              </span>
              <span>({prompt.ratingCount})</span>
            </span>
          ) : (
            <span className="text-gray-300">ยังไม่มีคะแนน</span>
          )}
          <span className="flex items-center gap-1">
            <span>📋</span>
            <span>{prompt.copyCount}</span>
          </span>
        </div>
      </div>
    </button>
  );
}
