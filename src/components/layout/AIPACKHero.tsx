"use client";

import { Stage } from "@prisma/client";
import clsx from "clsx";

const STAGES: { value: Stage; label: string; emoji: string; color: string }[] =
  [
    { value: Stage.DESIGN, label: "วิเคราะห์\n& ออกแบบ", emoji: "🔭", color: "bg-[#0369a1]" },
    { value: Stage.MATERIAL, label: "สร้างสื่อ\n& ใบงาน", emoji: "📝", color: "bg-[#0891b2]" },
    { value: Stage.FACILITATE, label: "จัดกิจกรรม\nในชั้นเรียน", emoji: "🎓", color: "bg-[#0d9488]" },
    { value: Stage.ASSESS, label: "ประเมิน\n& ป้อนกลับ", emoji: "📊", color: "bg-[#65a30d]" },
    { value: Stage.REFLECT, label: "สะท้อนคิด\n& ต่อยอด", emoji: "💡", color: "bg-[#d97706]" },
  ];

interface AIPACKHeroProps {
  selectedStage: Stage | null;
  onStageChange: (stage: Stage | null) => void;
}

export function AIPACKHero({ selectedStage, onStageChange }: AIPACKHeroProps) {
  return (
    <section className="bg-river py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            สายน้ำ AIPACK
          </h1>
          <p className="text-white/70 text-sm mt-1">
            เลือกขั้นตอนเพื่อกรองพรอมต์ตามกระบวนการจัดการเรียนรู้
          </p>
        </div>

        {/* River flow */}
        <div className="relative flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto pb-2">
          {STAGES.map((stage, idx) => (
            <div key={stage.value} className="flex items-center shrink-0">
              {/* Stage button */}
              <button
                onClick={() =>
                  onStageChange(selectedStage === stage.value ? null : stage.value)
                }
                className={clsx(
                  "flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-white font-medium transition-all duration-200 w-[76px] sm:w-[90px]",
                  "border-2 text-xs leading-tight text-center whitespace-pre-line",
                  selectedStage === stage.value
                    ? [stage.color, "border-gold shadow-lg scale-105"]
                    : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40"
                )}
              >
                <span className="text-xl">{stage.emoji}</span>
                <span>{stage.label}</span>
              </button>
              {/* Arrow connector */}
              {idx < STAGES.length - 1 && (
                <span className="text-gold text-lg mx-0.5 sm:mx-1">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Stage number labels */}
        <div className="flex justify-center gap-1 sm:gap-2 mt-1 overflow-x-auto">
          {STAGES.map((stage, idx) => (
            <div key={stage.value} className="flex items-center shrink-0">
              <span className="text-white/40 text-xs w-[76px] sm:w-[90px] text-center">
                {idx + 1}
              </span>
              {idx < STAGES.length - 1 && (
                <span className="mx-0.5 sm:mx-1 w-4 sm:w-5" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
