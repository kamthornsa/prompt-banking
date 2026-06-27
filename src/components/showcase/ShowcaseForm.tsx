"use client";

import { useState, useTransition } from "react";
import { createShowcase } from "@/actions/showcases";
import { useToast } from "@/components/ui/Toast";

interface ShowcaseFormProps {
  promptId: string;
  onCreated: () => void;
  onCancel: () => void;
}

const ALLOWED_DOMAINS = [
  "drive.google.com",
  "docs.google.com",
  "slides.google.com",
  "canva.com",
  "www.canva.com",
  "onedrive.live.com",
  "1drv.ms",
  "sharepoint.com",
  "chat.openai.com",
  "chatgpt.com",
  "gemini.google.com",
  "aistudio.google.com",
  "claude.ai",
  "notebooklm.google.com",
];

export function ShowcaseForm({ promptId, onCreated, onCancel }: ShowcaseFormProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const validateUrl = (url: string) => {
    if (!url) { setUrlError(null); return; }
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") { setUrlError("ต้องเป็น HTTPS"); return; }
      const domainOk = ALLOWED_DOMAINS.some(
        (d) => u.hostname === d || u.hostname.endsWith(`.${d}`)
      );
      if (!domainOk) {
        setUrlError("ไม่รองรับโดเมนนี้ ดูรายการที่รองรับด้านล่าง");
        return;
      }
    } catch {
      setUrlError("URL ไม่ถูกต้อง");
      return;
    }
    setUrlError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { showToast("กรุณาใส่ชื่อผลงาน", "error"); return; }
    if (urlError) return;

    startTransition(async () => {
      const result = await createShowcase({
        promptId,
        title,
        description,
        externalUrl,
      });
      if (result.ok) {
        showToast("เพิ่มผลงานแล้ว ✓", "success");
        onCreated();
      } else {
        showToast(result.error ?? "เกิดข้อผิดพลาด", "error");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-4 rounded-xl"
      style={{ background: "#F6F5F0", border: "1px solid #E7E3D9" }}
    >
      <h4 className="text-sm font-semibold" style={{ color: "#18302D" }}>
        เพิ่มผลงานของคุณ
      </h4>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="ชื่อผลงาน *"
        maxLength={200}
        required
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-river"
        style={{ border: "1px solid #E7E3D9", background: "#fff", color: "#18302D" }}
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 300))}
        placeholder="คำอธิบายสั้น ๆ (ไม่บังคับ)"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-river"
        style={{ border: "1px solid #E7E3D9", background: "#fff", color: "#18302D" }}
      />

      {/* URL input */}
      <div className="space-y-1">
        <input
          type="url"
          value={externalUrl}
          onChange={(e) => {
            setExternalUrl(e.target.value);
            validateUrl(e.target.value);
          }}
          placeholder="https://..."
          required
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-river"
          style={{ border: "1px solid #E7E3D9", background: "#fff", color: "#18302D" }}
        />
        {urlError && <p className="text-xs text-red-500">{urlError}</p>}
        <p className="text-xs leading-relaxed" style={{ color: "#9AA6A3" }}>
          รองรับ: Google Drive · Canva · OneDrive · ChatGPT · Gemini · Claude · NotebookLM · Google AI Studio
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || !externalUrl || !!urlError}
          className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ background: "#0E5C53" }}
        >
          {isPending ? "กำลังบันทึก..." : "บันทึกผลงาน"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{ background: "#fff", border: "1px solid #E7E3D9", color: "#6B7B78" }}
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
