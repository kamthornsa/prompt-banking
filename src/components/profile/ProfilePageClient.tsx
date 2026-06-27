"use client";

import Image from "next/image";
import { useState } from "react";
import { Role } from "@prisma/client";
import { PublicProfile } from "@/actions/profile";
import { TEACHING_SUBJECT_LABELS } from "@/lib/constants";
import { PromptModal } from "@/components/prompts/PromptModal";

const STAGE_LABELS: Record<string, string> = {
  DESIGN: "ออกแบบ",
  MATERIAL: "สร้างสื่อ",
  FACILITATE: "จัดกิจกรรม",
  ASSESS: "ประเมินผล",
  REFLECT: "สะท้อนคิด",
};

const SUBJECT_LABELS: Record<string, string> = {
  THAI: "ภาษาไทย",
  SCIENCE: "วิทยาศาสตร์",
  SOCIAL: "สังคมศึกษา",
  CROSS: "ข้ามวิชา",
};

const SKILL_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  RL:   { label: "RL",    color: "#246F95", bg: "#E5F0F7" },
  CT:   { label: "CT",    color: "#B5772A", bg: "#FBEFE0" },
  BOTH: { label: "RL+CT", color: "#6A57C2", bg: "#EFEAFA" },
};

interface ProfilePageClientProps {
  profile: PublicProfile;
}

type Tab = "prompts" | "showcases";

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("prompts");
  const isAuthorOrAdmin = profile.role === Role.AUTHOR || profile.role === Role.ADMIN;

  return (
    <>
      <div className="flex-1 w-full max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        {/* Profile card */}
        <div
          className="p-6 rounded-2xl mb-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
          style={{ background: "#fff", border: "1px solid #E7E3D9" }}
        >
          {profile.image ? (
            <Image
              src={profile.image}
              alt={profile.name ?? ""}
              width={80}
              height={80}
              className="rounded-full shrink-0"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl text-white shrink-0"
              style={{ background: "#0E9E6E" }}
            >
              {profile.name?.[0] ?? "?"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1
                className="font-serif text-xl font-bold"
                style={{ color: "#18302D" }}
              >
                {profile.name ?? "ไม่ระบุชื่อ"}
              </h1>
              {profile.role === Role.ADMIN && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "#FBE9E2", color: "#B54B2C" }}
                >
                  ผู้ดูแลระบบ
                </span>
              )}
              {profile.role === Role.AUTHOR && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "#E2F4EC", color: "#0A6B4D" }}
                >
                  ผู้เขียนพรอมต์
                </span>
              )}
            </div>

            {profile.school && (
              <p className="text-sm mb-1" style={{ color: "#6B7B78" }}>
                🏫 {profile.school}
              </p>
            )}

            {profile.bio && (
              <p
                className="text-sm leading-relaxed mb-2"
                style={{ color: "#6B7B78" }}
              >
                {profile.bio}
              </p>
            )}

            {profile.teachingSubjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.teachingSubjects.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ background: "#E2F4EC", color: "#0A6B4D" }}
                  >
                    {TEACHING_SUBJECT_LABELS[s] ?? s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        {isAuthorOrAdmin && (
          <section>
            {/* Tab bar */}
            <div
              className="flex gap-1 mb-5 p-1 rounded-xl w-fit"
              style={{ background: "#E7E3D9" }}
            >
              <button
                onClick={() => setActiveTab("prompts")}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  activeTab === "prompts"
                    ? { background: "#fff", color: "#0E5C53", boxShadow: "0 1px 3px rgba(0,0,0,.1)" }
                    : { color: "#6B7B78" }
                }
              >
                พรอมต์ ({profile.promptsCreated.length})
              </button>
              <button
                onClick={() => setActiveTab("showcases")}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  activeTab === "showcases"
                    ? { background: "#fff", color: "#0E5C53", boxShadow: "0 1px 3px rgba(0,0,0,.1)" }
                    : { color: "#6B7B78" }
                }
              >
                ผลงาน ({profile.showcases.length})
              </button>
            </div>

            {/* Prompts tab */}
            {activeTab === "prompts" && (
              profile.promptsCreated.length === 0 ? (
                <div
                  className="text-center py-12 rounded-2xl text-sm"
                  style={{ background: "#fff", border: "1px solid #E7E3D9", color: "#9AA6A3" }}
                >
                  ยังไม่มีพรอมต์ที่เผยแพร่
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.promptsCreated.map((p) => {
                    const skill = SKILL_STYLE[p.skill] ?? SKILL_STYLE.RL;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPromptId(p.id)}
                        className="text-left p-4 rounded-xl transition-all hover:shadow-md group"
                        style={{ background: "#fff", border: "1px solid #E7E3D9" }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: skill.bg, color: skill.color }}
                          >
                            {skill.label}
                          </span>
                          <span className="text-xs" style={{ color: "#9AA6A3" }}>
                            {STAGE_LABELS[p.stage]}
                          </span>
                        </div>
                        <p
                          className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-river transition-colors"
                          style={{ color: "#18302D" }}
                        >
                          {p.title}
                        </p>
                        <p className="text-xs mt-1.5" style={{ color: "#9AA6A3" }}>
                          {SUBJECT_LABELS[p.subject] ?? p.subject} · คัดลอก{" "}
                          {p.copyCount} ครั้ง
                        </p>
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {/* Showcases tab */}
            {activeTab === "showcases" && (
              profile.showcases.length === 0 ? (
                <div
                  className="text-center py-12 rounded-2xl text-sm"
                  style={{ background: "#fff", border: "1px solid #E7E3D9", color: "#9AA6A3" }}
                >
                  ยังไม่มีผลงานที่แบ่งปัน
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profile.showcases.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl overflow-hidden flex flex-col"
                      style={{ background: "#fff", border: "1px solid #E7E3D9" }}
                    >
                      {/* Link preview header */}
                      {s.externalUrl ? (
                        <a
                          href={s.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-32 text-2xl"
                          style={{ background: "#F6F5F0", borderBottom: "1px solid #E7E3D9" }}
                        >
                          🔗
                        </a>
                      ) : null}

                      {/* Body */}
                      <div className="p-3 flex flex-col gap-1 flex-1">
                        <p
                          className="text-sm font-medium line-clamp-2 leading-snug"
                          style={{ color: "#18302D" }}
                        >
                          {s.title}
                        </p>
                        <p className="text-xs line-clamp-1" style={{ color: "#9AA6A3" }}>
                          จากพรอมต์: {s.prompt.title}
                        </p>
                        <div className="flex items-center gap-2 mt-auto pt-1">
                          <span className="text-xs" style={{ color: "#C18C2A" }}>
                            {"★".repeat(Math.round(s.avgRating ?? 0))}
                            {"☆".repeat(5 - Math.round(s.avgRating ?? 0))}
                          </span>
                          <span className="text-xs" style={{ color: "#9AA6A3" }}>
                            {s._count.ratings} รีวิว
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>
        )}
      </div>

      {selectedPromptId && (
        <PromptModal
          promptId={selectedPromptId}
          onClose={() => setSelectedPromptId(null)}
        />
      )}
    </>
  );
}
