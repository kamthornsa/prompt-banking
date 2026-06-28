"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TeachingSubject } from "@prisma/client";
import { updateProfile, generateUniqueSlug, UserProfile } from "@/actions/profile";
import { TEACHING_SUBJECT_LABELS } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

interface ProfileFormProps {
  profile: UserProfile;
}

const ALL_SUBJECTS = Object.values(TeachingSubject);
const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, startGenerating] = useTransition();

  const [slug, setSlug] = useState(profile.slug ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [school, setSchool] = useState(profile.school ?? "");
  const [subjects, setSubjects] = useState<TeachingSubject[]>(profile.teachingSubjects);
  const [slugError, setSlugError] = useState<string | null>(null);

  const validateSlug = (val: string) => {
    if (!val) { setSlugError(null); return; }
    if (val.length < 2) { setSlugError("อย่างน้อย 2 ตัวอักษร"); return; }
    if (val.length > 30) { setSlugError("ไม่เกิน 30 ตัวอักษร"); return; }
    if (!SLUG_REGEX.test(val)) {
      setSlugError("ใช้ได้แค่ a-z, 0-9 และขีด (-) ห้ามขึ้น/ลงท้ายด้วยขีด");
      return;
    }
    setSlugError(null);
  };

  const handleSlugChange = (val: string) => {
    const lower = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(lower);
    validateSlug(lower);
  };

  const toggleSubject = (s: TeachingSubject) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleAutoGenerate = () => {
    startGenerating(async () => {
      const suggested = await generateUniqueSlug(profile.name ?? "user");
      setSlug(suggested);
      validateSlug(suggested);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) return;

    startTransition(async () => {
      const result = await updateProfile({
        slug,
        bio,
        school,
        teachingSubjects: subjects,
      });
      if (result.ok) {
        showToast("บันทึกโปรไฟล์แล้ว ✓", "success");
        router.refresh();
      } else {
        showToast(result.error ?? "เกิดข้อผิดพลาด", "error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar preview */}
      <div
        className="p-4 rounded-2xl flex items-center gap-4"
        style={{ background: "#fff", border: "1px solid #E7E3D9" }}
      >
        {profile.image ? (
          <Image
            src={profile.image}
            alt={profile.name ?? ""}
            width={56}
            height={56}
            className="rounded-full shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white shrink-0"
            style={{ background: "#0E9E6E" }}
          >
            {profile.name?.[0] ?? "?"}
          </div>
        )}
        <div>
          <div className="font-semibold text-base" style={{ color: "#18302D" }}>
            {profile.name}
          </div>
          <div className="text-xs" style={{ color: "#9AA6A3" }}>
            {profile.email}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#9AA6A3" }}>
            รูปโปรไฟล์จาก Google Account
          </div>
        </div>
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: "#18302D" }}>
          URL โปรไฟล์{" "}
          <span className="text-xs font-normal" style={{ color: "#9AA6A3" }}>
            (ไม่บังคับ)
          </span>
        </label>
        <div className="flex gap-2">
          <div
            className="flex-1 flex items-center rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-river"
            style={{ border: "1px solid #E7E3D9", background: "#fff" }}
          >
            <span className="pl-3 text-sm shrink-0 select-none" style={{ color: "#9AA6A3" }}>
              /u/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="your-name"
              className="flex-1 py-2.5 pr-3 text-sm bg-transparent focus:outline-none"
              style={{ color: "#18302D" }}
            />
          </div>
          <button
            type="button"
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className="px-3 py-2 text-xs font-medium rounded-xl border transition-colors disabled:opacity-50 shrink-0"
            style={{ border: "1px solid #E7E3D9", color: "#6B7B78", background: "#fff" }}
          >
            {isGenerating ? "..." : "สร้างอัตโนมัติ"}
          </button>
        </div>
        {slugError ? (
          <p className="text-xs text-red-500">{slugError}</p>
        ) : slug ? (
          <p className="text-xs" style={{ color: "#9AA6A3" }}>
            โปรไฟล์สาธารณะ:{" "}
            <a
              href={`${basePath}/u/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: "#0E5C53" }}
            >
              /u/{slug} ↗
            </a>
          </p>
        ) : null}
      </div>

      {/* School */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: "#18302D" }}>
          โรงเรียน
        </label>
        <input
          type="text"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="ชื่อโรงเรียนของคุณ"
          maxLength={200}
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-river"
          style={{ border: "1px solid #E7E3D9", background: "#fff", color: "#18302D" }}
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: "#18302D" }}>
          แนะนำตัว
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 300))}
          placeholder="เล่าให้ฟังนิดหน่อยเกี่ยวกับตัวคุณ..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-river"
          style={{ border: "1px solid #E7E3D9", background: "#fff", color: "#18302D" }}
        />
        <div className="text-right text-xs" style={{ color: "#9AA6A3" }}>
          {bio.length}/300
        </div>
      </div>

      {/* Teaching subjects */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold" style={{ color: "#18302D" }}>
          สาระที่สอน{" "}
          <span className="text-xs font-normal" style={{ color: "#9AA6A3" }}>
            (เลือกได้หลายสาระ)
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSubject(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={
                subjects.includes(s)
                  ? {
                      background: "#E2F4EC",
                      color: "#0A6B4D",
                      border: "1.5px solid #0E9E6E",
                    }
                  : {
                      background: "#fff",
                      color: "#6B7B78",
                      border: "1.5px solid #E7E3D9",
                    }
              }
            >
              {TEACHING_SUBJECT_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !!slugError}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
        style={{ background: "#0E5C53", color: "#fff" }}
      >
        {isPending ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
      </button>
    </form>
  );
}
