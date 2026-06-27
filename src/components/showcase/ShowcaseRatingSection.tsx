"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import {
  fetchShowcaseRatings,
  upsertShowcaseRating,
  hideShowcaseRatingComment,
  ShowcaseRatingsData,
} from "@/actions/showcase-ratings";
import { useToast } from "@/components/ui/Toast";
import { Role } from "@prisma/client";
import clsx from "clsx";

interface ShowcaseRatingSectionProps {
  showcaseId: string;
}

export function ShowcaseRatingSection({ showcaseId }: ShowcaseRatingSectionProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [data, setData] = useState<ShowcaseRatingsData | null>(null);
  const [hovered, setHovered] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchShowcaseRatings(showcaseId).then((d) => {
      setData(d);
      if (d.myRating) {
        setSelectedStar(d.myRating.value);
        setComment(d.myRating.comment ?? "");
      }
    });
  }, [showcaseId]);

  const handleSave = async () => {
    if (selectedStar === 0) return;
    setSaving(true);
    const result = await upsertShowcaseRating(
      showcaseId,
      selectedStar,
      comment || undefined
    );
    if (result.ok) {
      showToast("บันทึกคะแนนแล้ว ✓", "success");
      const refreshed = await fetchShowcaseRatings(showcaseId);
      setData(refreshed);
    } else {
      showToast(result.error ?? "เกิดข้อผิดพลาด", "error");
    }
    setSaving(false);
  };

  const handleHide = async (ratingId: string, hide: boolean) => {
    await hideShowcaseRatingComment(ratingId, hide);
    const refreshed = await fetchShowcaseRatings(showcaseId);
    setData(refreshed);
  };

  const displayStar = hovered || selectedStar;
  const isAdmin = session?.user?.role === Role.ADMIN;

  return (
    <div className="space-y-3 pt-2 border-t border-gray-100">
      {/* My rating */}
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: "#6B7B78" }}>
          ให้คะแนนผลงานนี้
        </p>

        {session?.user ? (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelectedStar(star)}
                  className={clsx(
                    "text-xl transition-transform hover:scale-110",
                    star <= displayStar ? "text-gold" : "text-gray-300"
                  )}
                  aria-label={`${star} ดาว`}
                >
                  ★
                </button>
              ))}
              {selectedStar > 0 && (
                <span className="text-xs self-center ml-1" style={{ color: "#9AA6A3" }}>
                  {selectedStar}/5
                </span>
              )}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 200))}
              placeholder="ความเห็น (ไม่บังคับ)"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-river"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "#9AA6A3" }}>
                {comment.length}/200
              </span>
              <button
                onClick={handleSave}
                disabled={saving || selectedStar === 0}
                className="bg-river hover:bg-river-dark text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : data?.myRating
                  ? "อัปเดตคะแนน"
                  : "บันทึกคะแนน"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="text-xs underline underline-offset-2 hover:text-river"
            style={{ color: "#6B7B78" }}
          >
            เข้าสู่ระบบเพื่อให้คะแนน
          </button>
        )}
      </div>

      {/* Review list */}
      {data && data.ratings.length > 0 && (
        <div className="space-y-2">
          {data.ratings.map((r) => (
            <div key={r.id} className="flex gap-2">
              {r.user.image ? (
                <Image
                  src={r.user.image}
                  alt={r.user.name ?? ""}
                  width={22}
                  height={22}
                  className="rounded-full shrink-0 mt-0.5"
                />
              ) : (
                <div
                  className="w-[22px] h-[22px] rounded-full bg-gray-200 shrink-0 mt-0.5 flex items-center justify-center text-[9px]"
                  style={{ color: "#9AA6A3" }}
                >
                  {r.user.name?.[0] ?? "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium truncate" style={{ color: "#18302D" }}>
                    {r.user.name ?? "ผู้ใช้"}
                  </span>
                  <span className="text-xs shrink-0" style={{ color: "#C18C2A" }}>
                    {"★".repeat(r.value)}
                    <span className="text-gray-300">{"★".repeat(5 - r.value)}</span>
                  </span>
                </div>
                {r.isHidden ? (
                  <p className="text-xs italic" style={{ color: "#9AA6A3" }}>
                    [ความเห็นถูกซ่อน]
                    {isAdmin && (
                      <button
                        onClick={() => handleHide(r.id, false)}
                        className="ml-2 underline"
                        style={{ color: "#0E5C53" }}
                      >
                        แสดง
                      </button>
                    )}
                  </p>
                ) : (
                  <>
                    {r.comment && (
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: "#6B7B78" }}>
                        {r.comment}
                        {isAdmin && (
                          <button
                            onClick={() => handleHide(r.id, true)}
                            className="ml-2 text-xs underline"
                            style={{ color: "#B54B2C" }}
                          >
                            ซ่อน
                          </button>
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
