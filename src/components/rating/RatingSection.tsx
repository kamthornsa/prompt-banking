"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { fetchRatings, upsertRating, hideRatingComment, RatingsData } from "@/actions/ratings";
import { useToast } from "@/components/ui/Toast";
import { Role } from "@prisma/client";
import clsx from "clsx";

interface RatingSectionProps {
  promptId: string;
}

export function RatingSection({ promptId }: RatingSectionProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [data, setData] = useState<RatingsData | null>(null);
  const [hovered, setHovered] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRatings(promptId).then((d) => {
      setData(d);
      if (d.myRating) {
        setSelectedStar(d.myRating.value);
        setComment(d.myRating.comment ?? "");
      }
    });
  }, [promptId]);

  const handleSave = async () => {
    if (selectedStar === 0) return;
    setSaving(true);
    const result = await upsertRating(promptId, selectedStar, comment || undefined);
    if (result.ok) {
      showToast("บันทึกคะแนนแล้ว ✓", "success");
      const refreshed = await fetchRatings(promptId);
      setData(refreshed);
    } else {
      showToast(result.error ?? "เกิดข้อผิดพลาด", "error");
    }
    setSaving(false);
  };

  const handleHide = async (ratingId: string, hide: boolean) => {
    await hideRatingComment(ratingId, hide);
    const refreshed = await fetchRatings(promptId);
    setData(refreshed);
  };

  const displayStar = hovered || selectedStar;
  const isAdmin = session?.user?.role === Role.ADMIN;

  return (
    <section className="border-t border-gray-100 pt-4 space-y-4">
      {/* My rating */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          ให้คะแนนพรอมต์นี้
        </h3>

        {session?.user ? (
          <div className="space-y-2">
            {/* Stars */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelectedStar(star)}
                  className={clsx(
                    "text-2xl transition-transform hover:scale-110",
                    star <= displayStar ? "text-gold" : "text-gray-300"
                  )}
                  aria-label={`${star} ดาว`}
                >
                  ★
                </button>
              ))}
              {selectedStar > 0 && (
                <span className="text-sm text-gray-500 self-center ml-2">
                  {selectedStar} / 5
                </span>
              )}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 200))}
              placeholder="ความเห็นสั้น ๆ (ไม่บังคับ)"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-river"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{comment.length}/200</span>
              <button
                onClick={handleSave}
                disabled={saving || selectedStar === 0}
                className="bg-river hover:bg-river-dark text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : data?.myRating ? "อัปเดตคะแนน" : "บันทึกคะแนน"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="text-sm text-river underline underline-offset-2 hover:text-river-dark"
          >
            เข้าสู่ระบบเพื่อให้คะแนน
          </button>
        )}
      </div>

      {/* Review list */}
      {data && data.ratings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            ความเห็นจากผู้ใช้ ({data.ratings.length})
          </h3>
          {data.ratings.map((r) => (
            <div key={r.id} className="flex gap-2.5">
              {r.user.image ? (
                <Image
                  src={r.user.image}
                  alt={r.user.name ?? ""}
                  width={28}
                  height={28}
                  className="rounded-full shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0 mt-0.5 flex items-center justify-center text-xs text-gray-400">
                  {r.user.name?.[0] ?? "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {r.user.name ?? "ผู้ใช้"}
                  </span>
                  <span className="text-xs text-gold shrink-0">
                    {"★".repeat(r.value)}
                    <span className="text-gray-300">
                      {"★".repeat(5 - r.value)}
                    </span>
                  </span>
                </div>
                {r.isHidden ? (
                  <p className="text-xs text-gray-400 italic">
                    [ความเห็นถูกซ่อน]
                    {isAdmin && (
                      <button
                        onClick={() => handleHide(r.id, false)}
                        className="ml-2 text-river underline"
                      >
                        แสดง
                      </button>
                    )}
                  </p>
                ) : (
                  r.comment && (
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {r.comment}
                      {isAdmin && (
                        <button
                          onClick={() => handleHide(r.id, true)}
                          className="ml-2 text-gray-400 hover:text-red-500 text-xs underline"
                        >
                          ซ่อน
                        </button>
                      )}
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
