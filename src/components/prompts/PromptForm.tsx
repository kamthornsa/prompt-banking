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
  redirectTo?: string;
}

const STAGE_OPTIONS: { value: Stage; label: string; desc: string }[] = [
  { value: "DESIGN",     label: "วิเคราะห์ & ออกแบบ",      desc: "DESIGN" },
  { value: "MATERIAL",   label: "สร้างสื่อ & ใบงาน",        desc: "MATERIAL" },
  { value: "FACILITATE", label: "จัดกิจกรรมในชั้นเรียน",    desc: "FACILITATE" },
  { value: "ASSESS",     label: "ประเมิน & ป้อนกลับ",       desc: "ASSESS" },
  { value: "REFLECT",    label: "สะท้อนคิด & ต่อยอด",      desc: "REFLECT" },
];

const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: "THAI",    label: "ภาษาไทย" },
  { value: "SCIENCE", label: "วิทยาศาสตร์" },
  { value: "SOCIAL",  label: "สังคมศึกษา" },
  { value: "CROSS",   label: "ข้ามวิชา" },
];

const SKILL_OPTIONS: { value: SkillFocus; label: string }[] = [
  { value: "RL",   label: "RL — อ่านออกเขียนได้" },
  { value: "CT",   label: "CT — คิดวิเคราะห์" },
  { value: "BOTH", label: "RL + CT — ทั้งสอง" },
];

const GRADE_OPTIONS: { value: Grade; label: string }[] = [
  { value: "M1",   label: "ม.1" },
  { value: "M2",   label: "ม.2" },
  { value: "M3",   label: "ม.3" },
  { value: "M1_3", label: "ม.1–3" },
];

// Shared styles
const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  border: "1px solid #E7E3D9",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  color: "#18302D",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export function PromptForm({ initialData, promptId, redirectTo = "/admin/prompts" }: PromptFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<FormData>>(initialData ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

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
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const focusStyle = (name: string): React.CSSProperties =>
    focused === name
      ? { ...inputStyle, borderColor: "#0E5C53", boxShadow: "0 0 0 3px rgba(14,92,83,0.12)" }
      : errors[name]
      ? { ...inputStyle, borderColor: "#E05A3A", boxShadow: "0 0 0 3px rgba(224,90,58,0.1)" }
      : inputStyle;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">

      {/* ── Title ── */}
      <FormSection>
        <FieldLabel htmlFor="title">ชื่อพรอมต์</FieldLabel>
        <input
          id="title"
          type="text"
          value={form.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          onFocus={() => setFocused("title")}
          onBlur={() => setFocused(null)}
          placeholder="เช่น วิเคราะห์ระดับความยากของบทอ่านสำหรับนักเรียน ม.2"
          style={focusStyle("title")}
        />
        {errors.title && <ErrorMsg>{errors.title}</ErrorMsg>}
      </FormSection>

      {/* ── Prompt text ── */}
      <FormSection>
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <FieldLabel htmlFor="text" noMargin>เนื้อหาพรอมต์</FieldLabel>
          <span className="text-xs" style={{ color: "#9AA6A3" }}>
            ใช้ [ตัวแปร] สำหรับส่วนที่ให้ครูแก้ไขเอง
          </span>
        </div>
        <textarea
          id="text"
          value={form.text ?? ""}
          onChange={(e) => set("text", e.target.value)}
          onFocus={() => setFocused("text")}
          onBlur={() => setFocused(null)}
          rows={12}
          placeholder={"คุณคือผู้ช่วยสอนภาษาไทยที่มีความเชี่ยวชาญ...\n\nกรุณาช่วย [ระบุงาน] สำหรับ [ระดับชั้น]..."}
          style={{
            ...focusStyle("text"),
            resize: "vertical",
            fontFamily: "'Courier New', Courier, monospace",
            lineHeight: 1.65,
          }}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.text
            ? <ErrorMsg>{errors.text}</ErrorMsg>
            : <span />}
          <span className="text-xs ml-auto" style={{ color: "#B5C5C2" }}>
            {(form.text ?? "").length} ตัวอักษร
          </span>
        </div>
      </FormSection>

      {/* ── Classifiers ── */}
      <FormSection title="การจัดหมวดหมู่">

        {/* Stage */}
        <PickerField label="ขั้นตอน" error={errors.stage} required>
          <div className="flex flex-wrap gap-2">
            {STAGE_OPTIONS.map((o) => (
              <PickerBtn
                key={o.value}
                active={form.stage === o.value}
                onClick={() => set("stage", o.value)}
              >
                {o.label}
              </PickerBtn>
            ))}
          </div>
        </PickerField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
          {/* Subject */}
          <PickerField label="วิชา" error={errors.subject} required>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map((o) => (
                <PickerBtn
                  key={o.value}
                  active={form.subject === o.value}
                  onClick={() => set("subject", o.value)}
                >
                  {o.label}
                </PickerBtn>
              ))}
            </div>
          </PickerField>

          {/* Grade */}
          <PickerField label="ระดับชั้น" error={errors.grade} required>
            <div className="flex flex-wrap gap-2">
              {GRADE_OPTIONS.map((o) => (
                <PickerBtn
                  key={o.value}
                  active={form.grade === o.value}
                  onClick={() => set("grade", o.value)}
                >
                  {o.label}
                </PickerBtn>
              ))}
            </div>
          </PickerField>
        </div>

        {/* Skill */}
        <PickerField label="ทักษะที่มุ่งเน้น" error={errors.skill} required className="mt-4">
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((o) => (
              <PickerBtn
                key={o.value}
                active={form.skill === o.value}
                onClick={() => set("skill", o.value)}
              >
                {o.label}
              </PickerBtn>
            ))}
          </div>
        </PickerField>

      </FormSection>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: "#0E5C53" }}
        >
          {saving ? "กำลังบันทึก..." : promptId ? "บันทึกการแก้ไข" : "เพิ่มพรอมต์"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ background: "#fff", border: "1px solid #E7E3D9", color: "#6B7B78" }}
        >
          ยกเลิก
        </button>
      </div>

    </form>
  );
}

// ── Sub-components ──

function FormSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl space-y-1.5"
      style={{ background: "#fff", border: "1px solid #E7E3D9" }}
    >
      {title && (
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "#9AA6A3" }}
        >
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
  noMargin,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  noMargin?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-semibold ${noMargin ? "" : "mb-1.5"}`}
      style={{ color: "#18302D" }}
    >
      {children}
    </label>
  );
}

function PickerField({
  label,
  error,
  children,
  required,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-semibold" style={{ color: "#18302D" }}>
        {label}
        {required && <span style={{ color: "#E05A3A" }}> *</span>}
      </p>
      {children}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  );
}

function PickerBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
      style={
        active
          ? {
              background: "#E2F4EC",
              color: "#0A6B4D",
              border: "1.5px solid #0E9E6E",
              boxShadow: "inset 0 1px 2px rgba(14,92,83,0.06)",
            }
          : {
              background: "#F6F5F0",
              color: "#6B7B78",
              border: "1.5px solid #E7E3D9",
            }
      }
    >
      {active && <span className="mr-1 text-xs">✓</span>}
      {children}
    </button>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-xs" style={{ color: "#E05A3A" }}>{children}</p>;
}
