"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stage, Subject, SkillFocus, Grade } from "@prisma/client";
import { createPrompt, updatePrompt } from "@/actions/prompts";
import { z } from "zod/v4";

const PromptSchema = z.object({
  title: z.string().min(3, "ชื่อต้องมีอย่างน้อย 3 ตัวอักษร").max(200),
  text: z.string().min(10, "เนื้อหาต้องมีอย่างน้อย 10 ตัวอักษร"),
  stage: z.enum(["DESIGN", "MATERIAL", "FACILITATE", "ASSESS", "REFLECT"]),
  subject: z.enum(["THAI", "SCIENCE", "SOCIAL", "CROSS"]),
  skill: z.enum(["RL", "CT", "BOTH"]),
  grade: z.enum(["M1", "M2", "M3", "M1_3"]),
});

type FormData = z.infer<typeof PromptSchema>;

interface PromptFormProps {
  initialData?: Partial<FormData>;
  promptId?: string;
}

const STAGE_OPTIONS = [
  { value: "DESIGN", label: "วิเคราะห์ & ออกแบบ" },
  { value: "MATERIAL", label: "สร้างสื่อ & ใบงาน" },
  { value: "FACILITATE", label: "จัดกิจกรรมในชั้นเรียน" },
  { value: "ASSESS", label: "ประเมิน & ป้อนกลับ" },
  { value: "REFLECT", label: "สะท้อนคิด & ต่อยอด" },
];

const SUBJECT_OPTIONS = [
  { value: "THAI", label: "ภาษาไทย" },
  { value: "SCIENCE", label: "วิทยาศาสตร์" },
  { value: "SOCIAL", label: "สังคมศึกษา" },
  { value: "CROSS", label: "ข้ามวิชา" },
];

const SKILL_OPTIONS = [
  { value: "RL", label: "RL (Reading Literacy)" },
  { value: "CT", label: "CT (Critical Thinking)" },
  { value: "BOTH", label: "RL + CT (ทั้งสอง)" },
];

const GRADE_OPTIONS = [
  { value: "M1", label: "ม.1" },
  { value: "M2", label: "ม.2" },
  { value: "M3", label: "ม.3" },
  { value: "M1_3", label: "ม.1–3" },
];

export function PromptForm({ initialData, promptId }: PromptFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<FormData>>(initialData ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = PromptSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errs[path] = issue.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (promptId) {
        await updatePrompt(promptId, parsed.data);
      } else {
        await createPrompt(parsed.data);
      }
      router.push("/admin/prompts");
      router.refresh();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Title */}
      <Field label="ชื่อพรอมต์" error={errors.title}>
        <input
          type="text"
          value={form.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="เช่น วิเคราะห์ระดับความยากของบทอ่าน"
          className="input"
        />
      </Field>

      {/* Text */}
      <Field label="เนื้อหาพรอมต์" error={errors.text} hint="ใช้ [ตัวแปร] สำหรับส่วนที่ให้ครูแก้ไขเอง">
        <textarea
          value={form.text ?? ""}
          onChange={(e) => set("text", e.target.value)}
          rows={10}
          placeholder="คุณคือ... ช่วย..."
          className="input resize-y font-mono text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        {/* Stage */}
        <Field label="ขั้นตอน (Stage)" error={errors.stage}>
          <select
            value={form.stage ?? ""}
            onChange={(e) => set("stage", e.target.value as Stage)}
            className="input"
          >
            <option value="">-- เลือก --</option>
            {STAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        {/* Subject */}
        <Field label="วิชา" error={errors.subject}>
          <select
            value={form.subject ?? ""}
            onChange={(e) => set("subject", e.target.value as Subject)}
            className="input"
          >
            <option value="">-- เลือก --</option>
            {SUBJECT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        {/* Skill */}
        <Field label="ทักษะ" error={errors.skill}>
          <select
            value={form.skill ?? ""}
            onChange={(e) => set("skill", e.target.value as SkillFocus)}
            className="input"
          >
            <option value="">-- เลือก --</option>
            {SKILL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        {/* Grade */}
        <Field label="ระดับชั้น" error={errors.grade}>
          <select
            value={form.grade ?? ""}
            onChange={(e) => set("grade", e.target.value as Grade)}
            className="input"
          >
            <option value="">-- เลือก --</option>
            {GRADE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-river hover:bg-river-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : promptId ? "บันทึกการแก้ไข" : "เพิ่มพรอมต์"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <style>{`.input { display: block; width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; } .input:focus { border-color: #0E5C53; box-shadow: 0 0 0 2px rgba(14,92,83,0.2); }`}</style>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
