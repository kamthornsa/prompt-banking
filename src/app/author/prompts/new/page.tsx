import Link from "next/link";
import { PromptForm } from "@/components/prompts/PromptForm";

export default function AuthorNewPromptPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/author/prompts"
          className="inline-flex items-center gap-1 text-sm mb-4"
          style={{ color: "#6B7B78", textDecoration: "none" }}
        >
          ← กลับไปยังรายการ
        </Link>
        <h1 className="font-serif font-bold text-[32px] leading-tight" style={{ color: "#18302D" }}>
          เพิ่มพรอมต์ใหม่
        </h1>
      </div>

      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
        style={{ background: "#FFFBEB", border: "1px solid #F5D87A", color: "#92650A" }}
      >
        <span className="text-base shrink-0">⚠️</span>
        <span>พรอมต์ที่สร้างจะอยู่ในสถานะ <strong>รออนุมัติ</strong> จนกว่า Admin ตรวจสอบและอนุมัติ</span>
      </div>

      <PromptForm redirectTo="/author/prompts" />
    </div>
  );
}
