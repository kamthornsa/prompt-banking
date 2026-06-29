"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deletePrompt, approvePrompt, rejectPrompt } from "@/actions/prompts";
import { PromptStatus } from "@prisma/client";

type Action = "unpublish" | "delete" | "publish";

const DIALOG_CONFIG: Record<
  Action,
  { title: string; message: (name: string) => string; confirmLabel: string; confirmColor: string; confirmBg: string; icon: string }
> = {
  unpublish: {
    title: "ยกเลิกการเผยแพร่",
    message: (name) => `พรอมต์ "${name}" จะถูกซ่อนจากหน้าสาธารณะทันที`,
    confirmLabel: "ยกเลิกเผยแพร่",
    confirmColor: "#fff",
    confirmBg: "#B54B2C",
    icon: "🔒",
  },
  delete: {
    title: "ลบพรอมต์",
    message: (name) => `พรอมต์ "${name}" จะถูกลบถาวร ไม่สามารถกู้คืนได้`,
    confirmLabel: "ลบถาวร",
    confirmColor: "#fff",
    confirmBg: "#B54B2C",
    icon: "🗑️",
  },
  publish: {
    title: "เผยแพร่พรอมต์",
    message: (name) => `พรอมต์ "${name}" จะปรากฏในหน้าสาธารณะทันที`,
    confirmLabel: "เผยแพร่",
    confirmColor: "#fff",
    confirmBg: "#0E9E6E",
    icon: "✅",
  },
};

interface Props {
  id: string;
  title: string;
  status: PromptStatus;
}

export function AdminPromptActions({ id, title, status }: Props) {
  const [dialog, setDialog] = useState<{ open: boolean; action: Action | null }>({
    open: false,
    action: null,
  });
  const [isPending, startTransition] = useTransition();

  function openDialog(action: Action) {
    setDialog({ open: true, action });
  }

  function closeDialog() {
    if (isPending) return;
    setDialog({ open: false, action: null });
  }

  function handleConfirm() {
    if (!dialog.action) return;
    const action = dialog.action;
    startTransition(async () => {
      if (action === "delete") await deletePrompt(id);
      else if (action === "unpublish") await rejectPrompt(id);
      else if (action === "publish") await approvePrompt(id);
      setDialog({ open: false, action: null });
    });
  }

  const cfg = dialog.action ? DIALOG_CONFIG[dialog.action] : null;

  return (
    <>
      {/* Row action buttons */}
      <div className="flex items-center gap-2 justify-end">
        <Link
          href={`/admin/prompts/${id}/edit`}
          style={{
            border: "1px solid #C8D5D2", color: "#18302D", borderRadius: 8,
            padding: "4px 12px", fontSize: 12, fontWeight: 500, textDecoration: "none",
            display: "inline-block",
          }}
        >
          แก้ไข
        </Link>

        {status === PromptStatus.PUBLISHED ? (
          <button
            onClick={() => openDialog("unpublish")}
            style={{
              border: "1px solid #F4C5BB", color: "#B54B2C", borderRadius: 8,
              padding: "4px 12px", fontSize: 12, fontWeight: 500, background: "transparent",
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            ยกเลิกเผยแพร่
          </button>
        ) : (
          <button
            onClick={() => openDialog("publish")}
            style={{
              border: "1px solid #A8DABC", color: "#0A6B4D", borderRadius: 8,
              padding: "4px 12px", fontSize: 12, fontWeight: 600, background: "#E2F4EC",
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            เผยแพร่
          </button>
        )}

        <button
          onClick={() => openDialog("delete")}
          style={{
            border: "1px solid #E7E3D9", color: "#9AA6A3", borderRadius: 8,
            padding: "4px 12px", fontSize: 12, fontWeight: 500, background: "transparent",
            cursor: "pointer",
          }}
        >
          ลบ
        </button>
      </div>

      {/* Confirmation Modal */}
      {dialog.open && cfg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(14,25,22,0.45)", backdropFilter: "blur(4px)" }}
          onClick={closeDialog}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "32px 28px",
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 24px 64px rgba(14,25,22,0.18)",
              animation: "fadeUp 0.18s ease",
            }}
          >
            {/* Icon */}
            <div
              className="flex items-center justify-center mx-auto mb-4"
              style={{
                width: 56, height: 56, borderRadius: 16,
                background: dialog.action === "publish" ? "#E2F4EC" : "#FDEEE9",
                fontSize: 26,
              }}
            >
              {cfg.icon}
            </div>

            {/* Title */}
            <h3
              className="text-center font-serif font-bold text-[20px] mb-2"
              style={{ color: "#18302D" }}
            >
              {cfg.title}
            </h3>

            {/* Message */}
            <p className="text-center text-sm mb-6" style={{ color: "#6B7B78", lineHeight: 1.6 }}>
              {cfg.message(title)}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeDialog}
                disabled={isPending}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 12,
                  border: "1px solid #E7E3D9", background: "#fff",
                  color: "#6B7B78", fontWeight: 600, fontSize: 14,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 12,
                  border: "none", background: cfg.confirmBg,
                  color: cfg.confirmColor, fontWeight: 700, fontSize: 14,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {isPending ? (
                  <>
                    <span
                      style={{
                        width: 14, height: 14, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    กำลังดำเนินการ…
                  </>
                ) : (
                  cfg.confirmLabel
                )}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
