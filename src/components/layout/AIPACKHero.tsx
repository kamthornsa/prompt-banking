"use client";

import { Stage } from "@prisma/client";

const STAGES: {
  value: Stage;
  num: number;
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
}[] = [
  { value: Stage.DESIGN,     num: 1, label: "ออกแบบ",     shortLabel: "ออกแบบ",     color: "#2E83A6", bg: "#E5F0F7" },
  { value: Stage.MATERIAL,   num: 2, label: "สร้างสื่อ",   shortLabel: "สร้างสื่อ",   color: "#1AA0A0", bg: "#E1F4F4" },
  { value: Stage.FACILITATE, num: 3, label: "จัดกิจกรรม", shortLabel: "จัดกิจกรรม", color: "#0E9E6E", bg: "#E2F4EC" },
  { value: Stage.ASSESS,     num: 4, label: "ประเมินผล",   shortLabel: "ประเมิน",     color: "#B5772A", bg: "#FBEFE0" },
  { value: Stage.REFLECT,    num: 5, label: "สะท้อนคิด",  shortLabel: "สะท้อนคิด",  color: "#B54B2C", bg: "#FBE9E2" },
];

interface AIPACKHeroProps {
  selectedStage: Stage | null;
  onStageChange: (stage: Stage | null) => void;
  promptCounts?: Partial<Record<Stage, number>>;
}

export function AIPACKHero({ selectedStage, onStageChange, promptCounts }: AIPACKHeroProps) {
  return (
    <section className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 pt-8 pb-4">
      <div
        className="relative overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid #E7E3D9",
          borderRadius: 26,
          padding: "38px 40px 30px",
          boxShadow: "0 1px 2px rgba(24,48,45,0.04)",
        }}
      >
        {/* Decorative radial gradient */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,158,110,0.10), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <span
          className="inline-flex items-center gap-[7px] text-[12.5px] font-semibold tracking-[0.2px]"
          style={{
            color: "#0A6B4D",
            background: "#E2F4EC",
            padding: "5px 12px",
            borderRadius: 999,
          }}
        >
          Kalasin CRAFT AI  
        </span>

        {/* Headline */}
        <h1
          className="font-serif font-bold text-[34px] sm:text-[38px] leading-[1.25] mt-4 max-w-[640px] tracking-[-0.3px]"
          style={{ color: "#18302D" }}
        >
          Classroom Prompt Banking<br />
          สำหรับโครงการ Kalasin CRAFT AI 
        </h1>

        {/* Subtitle */}
        <p
          className="text-[16px] leading-[1.7] mt-3 max-w-[560px]"
          style={{ color: "#6B7B78" }}
        >
          คลังพรอมต์สำหรับครูภาษาไทย วิทยาศาสตร์ และสังคมศึกษา ออกแบบการสอนที่พัฒนา
          <strong style={{ color: "#18302D", fontWeight: 600 }}> การอ่าน (RL)</strong> และ
          <strong style={{ color: "#18302D", fontWeight: 600 }}> การคิดเชิงวิพากษ์ (CT)</strong>
        </p>

        {/* AIPACK Stage Picker */}
        <div className="mt-7">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-serif font-semibold text-sm" style={{ color: "#18302D" }}>
              สายน้ำ AIPACK
            </span>
            <span className="text-[12.5px]" style={{ color: "#9AA6A3" }}>
              — เลือกขั้นตอนการสอนเพื่อกรองพรอมต์
            </span>
          </div>

          <div className="relative">
            {/* Gradient connecting line */}
            <div
              style={{
                position: "absolute",
                left: "7%",
                right: "7%",
                top: 25,
                height: 4,
                borderRadius: 3,
                background:
                  "linear-gradient(90deg, #2E83A6, #1AA0A0, #0E9E6E, #E0A23B, #D9694A)",
                opacity: 0.45,
              }}
            />

            {/* Stage buttons */}
            <div className="relative grid grid-cols-5 gap-2">
              {STAGES.map((stage) => {
                const isActive = selectedStage === stage.value;
                return (
                  <button
                    key={stage.value}
                    onClick={() => onStageChange(isActive ? null : stage.value)}
                    className="flex flex-col items-center gap-[9px] bg-transparent border-none cursor-pointer p-0 font-inherit"
                  >
                    {/* Circle */}
                    <span
                      className="w-[50px] h-[50px] rounded-full flex items-center justify-center font-serif font-bold text-[18px] transition-all duration-150"
                      style={
                        isActive
                          ? {
                              background: stage.color,
                              color: "#fff",
                              border: `3px solid ${stage.color}`,
                              boxShadow: `0 4px 12px ${stage.color}55`,
                              transform: "scale(1.1)",
                            }
                          : {
                              background: "#fff",
                              color: stage.color,
                              border: `3px solid ${stage.color}`,
                              boxShadow: "0 1px 3px rgba(24,48,45,0.08)",
                            }
                      }
                    >
                      {stage.num}
                    </span>
                    {/* Label */}
                    <span
                      className="text-[13px] font-semibold text-center leading-[1.25]"
                      style={{ color: isActive ? stage.color : "#18302D" }}
                    >
                      {stage.label}
                    </span>
                    {/* Count */}
                    {promptCounts && (
                      <span className="text-[11px]" style={{ color: "#9AA6A3" }}>
                        {promptCounts[stage.value] ?? 0} พรอมต์
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
