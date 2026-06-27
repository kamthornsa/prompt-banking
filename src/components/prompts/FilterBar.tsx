"use client";

import { Stage, Subject, Grade, SkillFocus } from "@prisma/client";

export interface FilterState {
  stage: Stage | "";
  subject: Subject | "";
  grade: Grade | "";
  skill: SkillFocus | "";
  search: string;
  sort: "newest" | "rating" | "copies" | "showcases";
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const SUBJECTS: { value: Subject; label: string }[] = [
  { value: Subject.THAI, label: "ภาษาไทย" },
  { value: Subject.SCIENCE, label: "วิทยาศาสตร์" },
  { value: Subject.SOCIAL, label: "สังคมศึกษา" },
  { value: Subject.CROSS, label: "ข้ามวิชา" },
];

const GRADES: { value: Grade; label: string }[] = [
  { value: Grade.M1, label: "ม.1" },
  { value: Grade.M2, label: "ม.2" },
  { value: Grade.M3, label: "ม.3" },
  { value: Grade.M1_3, label: "ม.1–3" },
];

const SKILLS: { value: SkillFocus; label: string; activeColor: string }[] = [
  { value: SkillFocus.RL,   label: "การอ่าน (RL)",     activeColor: "#38B2E8" },
  { value: SkillFocus.CT,   label: "คิดวิเคราะห์ (CT)", activeColor: "#F0A540" },
  { value: SkillFocus.BOTH, label: "ทั้งสอง (RL+CT)",   activeColor: "#A78BFA" },
];

const SORTS: { value: FilterState["sort"]; label: string }[] = [
  { value: "newest",    label: "ใหม่สุด" },
  { value: "rating",    label: "★ คะแนน" },
  { value: "copies",    label: "คัดลอกมาก" },
  { value: "showcases", label: "🔗 ผลงาน" },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  const toggle = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    set(key, filters[key] === val ? ("" as FilterState[K]) : val);

  return (
    <div
      className="sticky z-30 py-3 px-4 sm:px-6"
      style={{ top: "64px", background: "rgba(246,245,240,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div
        className="max-w-[1180px] mx-auto"
        style={{
          background: "linear-gradient(135deg, #DF7028 0%, #C26830 28%, #4A8E72 60%, #0D5B50 100%)",
          borderRadius: 20,
          padding: "18px 22px",
          boxShadow: "0 4px 28px rgba(180,85,30,0.30), 0 1px 4px rgba(0,0,0,0.14)",
        }}
      >
        {/* Row 1: Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2.5 flex-1"
            style={{
              background: "rgba(0,0,0,0.22)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "10px 16px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
            </svg>
            <input
              type="search"
              placeholder="ค้นหาพรอมต์ เช่น อ่านจับใจความ, ใบงานทดลอง…"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[14.5px] font-inherit"
              style={{ color: "#fff" }}
            />
          </div>

          {/* Sort segmented control */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[12.5px] font-medium hidden sm:block" style={{ color: "rgba(255,255,255,0.55)" }}>
              เรียงตาม
            </span>
            <div
              className="flex gap-1"
              style={{
                background: "rgba(0,0,0,0.22)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 11,
                padding: 4,
              }}
            >
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => set("sort", s.value)}
                  className="px-[12px] py-[6px] rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-none font-inherit"
                  style={
                    filters.sort === s.value
                      ? { background: "#fff", color: "#7A3010", fontWeight: 700, boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }
                      : { background: "transparent", color: "rgba(255,255,255,0.7)" }
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Filter chips */}
        <div
          className="flex flex-col gap-3 mt-4 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {/* Subject row */}
          <FilterRow label="วิชา">
            <DarkChip label="ทั้งหมด" active={!filters.subject} onClick={() => set("subject", "")} />
            {SUBJECTS.map((s) => (
              <DarkChip
                key={s.value}
                label={s.label}
                active={filters.subject === s.value}
                onClick={() => toggle("subject", s.value)}
              />
            ))}
          </FilterRow>

          {/* Grade row */}
          <FilterRow label="ระดับ">
            <DarkChip label="ทั้งหมด" active={!filters.grade} onClick={() => set("grade", "")} />
            {GRADES.map((g) => (
              <DarkChip
                key={g.value}
                label={g.label}
                active={filters.grade === g.value}
                onClick={() => toggle("grade", g.value)}
              />
            ))}
          </FilterRow>

          {/* Skill row */}
          <FilterRow label="ทักษะ">
            <DarkChip label="ทั้งหมด" active={!filters.skill} onClick={() => set("skill", "")} />
            {SKILLS.map((sk) => (
              <DarkChip
                key={sk.value}
                label={sk.label}
                active={filters.skill === sk.value}
                onClick={() => toggle("skill", sk.value)}
                activeAccent={sk.activeColor}
              />
            ))}
          </FilterRow>
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="text-[12px] font-semibold shrink-0"
        style={{ color: "rgba(255,255,255,0.45)", width: 42 }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function DarkChip({
  label,
  active,
  onClick,
  activeAccent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeAccent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-[14px] py-[6px] rounded-full text-[13px] font-medium cursor-pointer transition-all whitespace-nowrap font-inherit"
      style={
        active
          ? {
              background: activeAccent ?? "#fff",
              color: activeAccent ? "#fff" : "#7A3010",
              border: `1.5px solid ${activeAccent ?? "#fff"}`,
              fontWeight: 700,
              boxShadow: activeAccent
                ? `0 0 12px ${activeAccent}55`
                : "0 2px 8px rgba(0,0,0,0.18)",
            }
          : {
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.75)",
              border: "1.5px solid rgba(255,255,255,0.15)",
            }
      }
    >
      {label}
    </button>
  );
}
