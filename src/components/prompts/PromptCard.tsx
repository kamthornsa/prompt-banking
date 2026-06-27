"use client";

import { Stage, Subject, SkillFocus, Grade } from "@prisma/client";

export interface PromptCardData {
  id: string;
  title: string;
  excerpt: string;
  stage: Stage;
  subject: Subject;
  skill: SkillFocus;
  grade: Grade;
  copyCount: number;
  avgRating: number | null;
  ratingCount: number;
}

const STAGE_LABELS: Record<Stage, string> = {
  DESIGN: "ออกแบบ",
  MATERIAL: "สร้างสื่อ",
  FACILITATE: "จัดกิจกรรม",
  ASSESS: "ประเมินผล",
  REFLECT: "สะท้อนคิด",
};

const STAGE_STYLE: Record<Stage, { color: string; bg: string }> = {
  DESIGN:     { color: "#2E83A6", bg: "#E5F0F7" },
  MATERIAL:   { color: "#1AA0A0", bg: "#E1F4F4" },
  FACILITATE: { color: "#0E9E6E", bg: "#E2F4EC" },
  ASSESS:     { color: "#B5772A", bg: "#FBEFE0" },
  REFLECT:    { color: "#B54B2C", bg: "#FBE9E2" },
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

const SKILL_STYLE: Record<SkillFocus, { label: string; color: string; bg: string }> = {
  RL:   { label: "การอ่าน (RL)",    color: "#246F95", bg: "#E5F0F7" },
  CT:   { label: "คิดวิเคราะห์ (CT)", color: "#B5772A", bg: "#FBEFE0" },
  BOTH: { label: "RL+CT",            color: "#6A57C2", bg: "#EFEAFA" },
};

interface PromptCardProps {
  prompt: PromptCardData;
  onClick: (id: string) => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const stage = STAGE_STYLE[prompt.stage];
  const skill = SKILL_STYLE[prompt.skill];

  return (
    <article
      onClick={() => onClick(prompt.id)}
      className="cursor-pointer flex flex-col gap-[13px] transition-all duration-150"
      style={{
        background: "#fff",
        border: "1px solid #E7E3D9",
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 1px 2px rgba(24,48,45,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(24,48,45,0.10)";
        (e.currentTarget as HTMLElement).style.borderColor = "#C5C0B8";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "none";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 2px rgba(24,48,45,0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = "#E7E3D9";
      }}
    >
      {/* Top row: stage badge + rating */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-[6px] text-[12px] font-semibold px-[11px] py-[4px] rounded-full whitespace-nowrap"
          style={{ background: stage.bg, color: stage.color }}
        >
          <span style={{ fontSize: 8 }}>●</span>
          {STAGE_LABELS[prompt.stage]}
        </span>

        {prompt.ratingCount > 0 ? (
          <span className="flex items-center gap-1 text-[13px] whitespace-nowrap" style={{ color: "#6B7B78" }}>
            <span style={{ color: "#C58A1F", fontSize: 15 }}>★</span>
            <strong style={{ color: "#18302D", fontWeight: 600 }}>{prompt.avgRating!.toFixed(1)}</strong>
            <span>({prompt.ratingCount})</span>
          </span>
        ) : (
          <span className="text-[12px]" style={{ color: "#9AA6A3" }}>ยังไม่มีคะแนน</span>
        )}
      </div>

      {/* Title */}
      <h3
        className="font-serif font-semibold text-[17px] leading-[1.4]"
        style={{ color: "#18302D" }}
      >
        {prompt.title}
      </h3>

      {/* Excerpt */}
      {prompt.excerpt && (
        <p className="text-[13.5px] leading-[1.65] flex-1" style={{ color: "#6B7B78" }}>
          {prompt.excerpt}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-[6px]">
        <span
          className="text-[11.5px] font-medium px-[10px] py-[4px] rounded-[7px]"
          style={{ background: "#F0ECE2", color: "#6B7B78" }}
        >
          {SUBJECT_LABELS[prompt.subject]}
        </span>
        <span
          className="text-[11.5px] font-medium px-[10px] py-[4px] rounded-[7px]"
          style={{ background: "#F0ECE2", color: "#6B7B78" }}
        >
          {GRADE_LABELS[prompt.grade]}
        </span>
        <span
          className="inline-flex items-center gap-[6px] text-[12px] font-semibold px-[11px] py-[4px] rounded-full whitespace-nowrap"
          style={{ background: skill.bg, color: skill.color }}
        >
          {skill.label}
        </span>
      </div>

      {/* Footer: copy count + copy button */}
      <div
        className="flex items-center justify-between pt-[13px]"
        style={{ borderTop: "1px dashed #E7E3D9" }}
      >
        <span
          className="flex items-center gap-[6px] text-[12.5px]"
          style={{ color: "#9AA6A3" }}
        >
          <CopyIcon />
          คัดลอกแล้ว {prompt.copyCount} ครั้ง
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(prompt.id); }}
          className="flex items-center gap-[6px] text-[13px] font-semibold rounded-[9px] px-[13px] py-[7px] transition-colors"
          style={{ background: "#E2F4EC", color: "#0A6B4D", border: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#CCF0E0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#E2F4EC"; }}
        >
          <CopyIcon />
          คัดลอก
        </button>
      </div>
    </article>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  );
}
