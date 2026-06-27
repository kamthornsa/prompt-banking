"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ShowcaseWithAuthor, deleteShowcase, hideShowcase } from "@/actions/showcases";
import { ShowcaseRatingSection } from "./ShowcaseRatingSection";
import { useToast } from "@/components/ui/Toast";

interface ShowcaseCardProps {
  showcase: ShowcaseWithAuthor;
  onDeleted?: (id: string) => void;
  onHidden?: (id: string, hidden: boolean) => void;
}

export function ShowcaseCard({ showcase, onDeleted, onHidden }: ShowcaseCardProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = session?.user?.role === Role.ADMIN;
  const isOwner = session?.user?.id === showcase.author.id;

  const handleDelete = async () => {
    if (!confirm("ต้องการลบผลงานนี้?")) return;
    setDeleting(true);
    const result = await deleteShowcase(showcase.id);
    setDeleting(false);
    if (result.ok) {
      showToast("ลบผลงานแล้ว", "success");
      onDeleted?.(showcase.id);
    } else {
      showToast(result.error ?? "เกิดข้อผิดพลาด", "error");
    }
  };

  const handleHide = async (hide: boolean) => {
    const result = await hideShowcase(showcase.id, hide);
    if (result.ok) {
      showToast(hide ? "ซ่อนผลงานแล้ว" : "แสดงผลงานแล้ว", "success");
      onHidden?.(showcase.id, hide);
    } else {
      showToast(result.error ?? "เกิดข้อผิดพลาด", "error");
    }
  };

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all ${showcase.isHidden ? "opacity-60" : ""}`}
      style={{ background: "#fff", border: "1px solid #E7E3D9" }}
    >
      {/* Link preview header */}
      {showcase.externalUrl ? (
        <a
          href={showcase.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-36 text-3xl transition-colors hover:bg-gray-50"
          style={{ background: "#F6F5F0", borderBottom: "1px solid #E7E3D9" }}
        >
          🔗
        </a>
      ) : null}

      {/* Card body */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {showcase.externalUrl ? (
              <a
                href={showcase.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold line-clamp-2 hover:underline"
                style={{ color: "#18302D" }}
              >
                {showcase.title}
              </a>
            ) : (
              <p
                className="text-sm font-semibold line-clamp-2"
                style={{ color: "#18302D" }}
              >
                {showcase.title}
              </p>
            )}
            {showcase.description && (
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#6B7B78" }}>
                {showcase.description}
              </p>
            )}
          </div>

          {/* Actions */}
          {(isOwner || isAdmin) && (
            <div className="flex gap-1 shrink-0">
              {isAdmin && (
                <button
                  onClick={() => handleHide(!showcase.isHidden)}
                  className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: "#9AA6A3" }}
                  title={showcase.isHidden ? "แสดง" : "ซ่อน"}
                >
                  {showcase.isHidden ? "👁" : "🚫"}
                </button>
              )}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-red-50 disabled:opacity-50"
                  style={{ color: "#B54B2C" }}
                  title="ลบผลงาน"
                >
                  🗑
                </button>
              )}
            </div>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center gap-1.5">
          {showcase.author.image ? (
            <Image
              src={showcase.author.image}
              alt={showcase.author.name ?? ""}
              width={18}
              height={18}
              className="rounded-full shrink-0"
            />
          ) : (
            <div
              className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: "#0E9E6E" }}
            >
              {showcase.author.name?.[0] ?? "?"}
            </div>
          )}
          {showcase.author.slug ? (
            <Link
              href={`/u/${showcase.author.slug}`}
              className="text-xs hover:underline truncate"
              style={{ color: "#6B7B78" }}
            >
              {showcase.author.name}
            </Link>
          ) : (
            <span className="text-xs truncate" style={{ color: "#6B7B78" }}>
              {showcase.author.name}
            </span>
          )}

          {showcase._count.ratings > 0 && (
            <span className="text-xs ml-auto shrink-0" style={{ color: "#C18C2A" }}>
              ★ {showcase.avgRating?.toFixed(1)} ({showcase._count.ratings})
            </span>
          )}
        </div>

        {/* Rating toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full text-xs py-1.5 rounded-lg transition-colors"
          style={
            expanded
              ? { background: "#E2F4EC", color: "#0A6B4D" }
              : { background: "#F6F5F0", color: "#6B7B78" }
          }
        >
          {expanded ? "▲ ซ่อนความเห็น" : "▼ ดูและให้คะแนน"}
        </button>

        {expanded && (
          <ShowcaseRatingSection showcaseId={showcase.id} />
        )}
      </div>
    </div>
  );
}
