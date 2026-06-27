"use client";

import { useState, useTransition } from "react";
import { deleteShowcase } from "@/actions/showcases";
import { useToast } from "@/components/ui/Toast";

export function DeleteShowcaseButton({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted: () => void;
}) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("ต้องการลบผลงานนี้?")) return;
    startTransition(async () => {
      const result = await deleteShowcase(id);
      if (result.ok) {
        showToast("ลบผลงานแล้ว", "success");
        onDeleted();
      } else {
        showToast(result.error ?? "เกิดข้อผิดพลาด", "error");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      style={{ background: "#FDEEE9", color: "#B54B2C" }}
    >
      {isPending ? "กำลังลบ..." : "ลบ"}
    </button>
  );
}
