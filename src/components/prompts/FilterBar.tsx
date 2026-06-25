"use client";

import { Stage, Subject, Grade, SkillFocus } from "@prisma/client";
import clsx from "clsx";

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

const SKILLS: { value: SkillFocus; label: string }[] = [
  { value: SkillFocus.RL, label: "RL" },
  { value: SkillFocus.CT, label: "CT" },
  { value: SkillFocus.BOTH, label: "RL+CT" },
];

const SORTS: { value: FilterState["sort"]; label: string }[] = [
  { value: "newest", label: "ใหม่สุด" },
  { value: "rating", label: "คะแนนสูงสุด" },
  { value: "copies", label: "คัดลอกมากสุด" },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  const toggleFilter = <K extends keyof FilterState>(
    key: K,
    val: FilterState[K]
  ) => set(key, filters[key] === val ? ("" as FilterState[K]) : val);

  return (
    <div className="bg-white border-b border-paper-dark shadow-sm sticky top-[57px] z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
        {/* Search + Sort */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <input
            type="search"
            placeholder="ค้นหาพรอมต์..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-river focus:border-transparent"
          />
          <select
            value={filters.sort}
            onChange={(e) =>
              set("sort", e.target.value as FilterState["sort"])
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-river bg-white"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {/* Subject */}
          {SUBJECTS.map((s) => (
            <FilterChip
              key={s.value}
              label={s.label}
              active={filters.subject === s.value}
              onClick={() => toggleFilter("subject", s.value)}
            />
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {/* Grade */}
          {GRADES.map((g) => (
            <FilterChip
              key={g.value}
              label={g.label}
              active={filters.grade === g.value}
              onClick={() => toggleFilter("grade", g.value)}
            />
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {/* Skill */}
          {SKILLS.map((sk) => (
            <FilterChip
              key={sk.value}
              label={sk.label}
              active={filters.skill === sk.value}
              color={sk.value}
              onClick={() => toggleFilter("skill", sk.value)}
            />
          ))}
          {/* Reset */}
          {(filters.subject || filters.grade || filters.skill || filters.search) && (
            <button
              onClick={() =>
                onChange({ stage: filters.stage, subject: "", grade: "", skill: "", search: "", sort: filters.sort })
              }
              className="text-xs text-gray-500 hover:text-river underline underline-offset-2 ml-1"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: SkillFocus;
  onClick: () => void;
}) {
  const colorMap: Record<SkillFocus, { bg: string; text: string; activeBg: string; activeText: string }> = {
    RL:   { bg: "bg-rl-bg",   text: "text-rl",   activeBg: "bg-rl",   activeText: "text-white" },
    CT:   { bg: "bg-ct-bg",   text: "text-ct",   activeBg: "bg-ct",   activeText: "text-white" },
    BOTH: { bg: "bg-both-bg", text: "text-both", activeBg: "bg-both", activeText: "text-white" },
  };

  const c = color ? colorMap[color] : null;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-xs px-3 py-1 rounded-full border transition-all font-medium",
        active && c
          ? `${c.activeBg} ${c.activeText} border-transparent`
          : active
          ? "bg-river text-white border-transparent"
          : c
          ? `${c.bg} ${c.text} border-transparent hover:opacity-80`
          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
      )}
    >
      {label}
    </button>
  );
}
