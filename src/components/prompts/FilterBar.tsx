"use client";

import { Stage, Subject, Grade, SkillFocus } from "@prisma/client";

export interface FilterState {
  stage: Stage | "";
  subject: Subject | "";
  grade: Grade | "";
  skill: SkillFocus | "";
  search: string;
  sort: "newest" | "rating" | "copies";
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

const SKILLS: { value: SkillFocus; label: string; color: string; bg: string }[] = [
  { value: SkillFocus.RL,   label: "การอ่าน (RL)",    color: "#246F95", bg: "#E5F0F7" },
  { value: SkillFocus.CT,   label: "คิดวิเคราะห์ (CT)", color: "#B5772A", bg: "#FBEFE0" },
  { value: SkillFocus.BOTH, label: "ทั้งสอง",          color: "#6A57C2", bg: "#EFEAFA" },
];

const SORTS: { value: FilterState["sort"]; label: string }[] = [
  { value: "newest", label: "ใหม่สุด" },
  { value: "rating", label: "คะแนน" },
  { value: "copies", label: "คัดลอกมากสุด" },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  const toggle = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    set(key, filters[key] === val ? ("" as FilterState[K]) : val);

  return (
    <div
      className="sticky z-30 py-3 px-4 sm:px-6"
      style={{ top: "64px", background: "rgba(246,245,240,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div
        className="max-w-[1180px] mx-auto"
        style={{
          background: "#fff",
          border: "1px solid #E7E3D9",
          borderRadius: 18,
          padding: "16px 20px",
          boxShadow: "0 1px 2px rgba(24,48,45,0.04)",
        }}
      >
        {/* Row 1: Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1"
            style={{
              border: "1px solid #E7E3D9",
              borderRadius: 12,
              padding: "9px 14px",
              background: "#F6F5F0",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA6A3" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
            </svg>
            <input
              type="search"
              placeholder="ค้นหาพรอมต์ เช่น อ่านจับใจความ, ใบงานทดลอง…"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[14.5px] font-inherit"
              style={{ color: "#18302D" }}
            />
          </div>

          {/* Sort segmented control */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[13px] font-medium" style={{ color: "#6B7B78" }}>เรียงตาม</span>
            <div
              className="flex gap-1"
              style={{
                background: "#F6F5F0",
                border: "1px solid #E7E3D9",
                borderRadius: 11,
                padding: 4,
              }}
            >
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => set("sort", s.value)}
                  className="px-[13px] py-[6px] rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-none font-inherit"
                  style={
                    filters.sort === s.value
                      ? { background: "#fff", color: "#18302D", fontWeight: 600, boxShadow: "0 1px 3px rgba(24,48,45,0.12)" }
                      : { background: "transparent", color: "#6B7B78" }
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
          style={{ borderTop: "1px solid #F0ECE2" }}
        >
          {/* Subject row */}
          <FilterRow label="วิชา">
            <PillChip
              label="ทั้งหมด"
              active={!filters.subject}
              onClick={() => set("subject", "")}
              activeColor="#0E9E6E"
              activeBg="#E2F4EC"
            />
            {SUBJECTS.map((s) => (
              <PillChip
                key={s.value}
                label={s.label}
                active={filters.subject === s.value}
                onClick={() => toggle("subject", s.value)}
                activeColor="#0E9E6E"
                activeBg="#E2F4EC"
              />
            ))}
          </FilterRow>

          {/* Grade row */}
          <FilterRow label="ระดับ">
            <PillChip
              label="ทั้งหมด"
              active={!filters.grade}
              onClick={() => set("grade", "")}
              activeColor="#0E9E6E"
              activeBg="#E2F4EC"
            />
            {GRADES.map((g) => (
              <PillChip
                key={g.value}
                label={g.label}
                active={filters.grade === g.value}
                onClick={() => toggle("grade", g.value)}
                activeColor="#0E9E6E"
                activeBg="#E2F4EC"
              />
            ))}
          </FilterRow>

          {/* Skill row */}
          <FilterRow label="ทักษะ">
            <PillChip
              label="ทั้งหมด"
              active={!filters.skill}
              onClick={() => set("skill", "")}
              activeColor="#0E9E6E"
              activeBg="#E2F4EC"
            />
            {SKILLS.map((sk) => (
              <PillChip
                key={sk.value}
                label={sk.label}
                active={filters.skill === sk.value}
                onClick={() => toggle("skill", sk.value)}
                activeColor={sk.color}
                activeBg={sk.bg}
                inactiveColor={sk.color}
                inactiveBg={sk.bg}
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
        style={{ color: "#9AA6A3", width: 42 }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function PillChip({
  label,
  active,
  onClick,
  activeColor,
  activeBg,
  inactiveColor,
  inactiveBg,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor: string;
  activeBg: string;
  inactiveColor?: string;
  inactiveBg?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-[14px] py-[7px] rounded-full text-[13.5px] font-medium cursor-pointer border transition-all whitespace-nowrap font-inherit"
      style={
        active
          ? { background: activeColor, color: "#fff", border: `1px solid ${activeColor}`, fontWeight: 600 }
          : inactiveColor
          ? { background: inactiveBg, color: inactiveColor, border: "1px solid transparent" }
          : { background: "#fff", color: "#6B7B78", border: "1px solid #E7E3D9" }
      }
    >
      {label}
    </button>
  );
}
