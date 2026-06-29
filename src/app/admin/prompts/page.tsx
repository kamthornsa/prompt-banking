import { prisma } from "@/lib/prisma";
import { Stage, PromptStatus } from "@prisma/client";
import Link from "next/link";
import { AdminPromptActions } from "../AdminPromptActions";

const PAGE_SIZE = 15;

type SortKey = "title" | "stage" | "status" | "copies" | "ratings";

const STAGE_LABELS: Record<Stage, string> = {
  DESIGN: "ออกแบบ",
  MATERIAL: "สร้างสื่อ",
  FACILITATE: "จัดกิจกรรม",
  ASSESS: "ประเมินผล",
  REFLECT: "สะท้อนคิด",
};

const STAGE_COLORS: Record<Stage, string> = {
  DESIGN: "#2E83A6",
  MATERIAL: "#1AA0A0",
  FACILITATE: "#0E9E6E",
  ASSESS: "#B5772A",
  REFLECT: "#B54B2C",
};

const STATUS_CONFIG: Record<PromptStatus, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "รออนุมัติ (เก่า)",   color: "#B5772A", bg: "#FBEFE0" },
  PUBLISHED: { label: "เผยแพร่",             color: "#0A6B4D", bg: "#E2F4EC" },
  REJECTED:  { label: "ยกเลิกเผยแพร่",      color: "#B54B2C", bg: "#FDEEE9" },
};

const STATUS_ORDER: Record<PromptStatus, number> = { PUBLISHED: 0, PENDING: 1, REJECTED: 2 };

export default async function AdminPromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string; dir?: string }>;
}) {
  const { q = "", page = "1", sort = "newest", dir = "desc" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const sortKey = (["title", "stage", "status", "copies", "ratings"].includes(sort) ? sort : "newest") as SortKey | "newest";
  const sortDir = dir === "asc" ? "asc" : "desc";

  const allPrompts = await prisma.prompt.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, stage: true, subject: true, grade: true,
      status: true, copyCount: true,
      createdBy: { select: { name: true, email: true } },
      _count: { select: { ratings: true } },
    },
  });

  // Search filter
  const query = q.trim().toLowerCase();
  const filtered = query
    ? allPrompts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.createdBy.name ?? p.createdBy.email ?? "").toLowerCase().includes(query),
      )
    : allPrompts;

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "title")   cmp = a.title.localeCompare(b.title, "th");
    else if (sortKey === "stage")   cmp = a.stage.localeCompare(b.stage);
    else if (sortKey === "status")  cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sortKey === "copies")  cmp = a.copyCount - b.copyCount;
    else if (sortKey === "ratings") cmp = a._count.ratings - b._count.ratings;
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paged      = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (query)             params.set("q",    q);
    if (safePage > 1)      params.set("page", String(safePage));
    if (sortKey !== "newest") params.set("sort", sortKey);
    if (sortDir !== "desc")   params.set("dir",  sortDir);
    Object.entries(overrides).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    const qs = params.toString();
    return `/admin/prompts${qs ? `?${qs}` : ""}`;
  }

  function sortUrl(key: SortKey) {
    const newDir = sortKey === key && sortDir === "desc" ? "asc" : "desc";
    return buildUrl({ sort: key, dir: newDir, page: "1" });
  }

  function pageUrl(p: number) {
    return buildUrl({ page: p > 1 ? String(p) : "" });
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-bold text-[28px]" style={{ color: "#18302D" }}>
          จัดการพรอมต์
          <span className="font-sans font-normal text-[15px] ml-2" style={{ color: "#6B7B78" }}>
            ({allPrompts.length})
          </span>
        </h1>
        <Link
          href="/admin/prompts/new"
          style={{ background: "#0E9E6E", color: "#fff", borderRadius: 12, padding: "10px 20px",
            fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", textDecoration: "none",
            display: "inline-block" }}
        >
          + เพิ่มพรอมต์
        </Link>
      </div>

      {/* Search bar */}
      <form method="GET" action="/admin/prompts" className="flex gap-2">
        {sortKey !== "newest" && <input type="hidden" name="sort" value={sortKey} />}
        {sortDir !== "desc"   && <input type="hidden" name="dir"  value={sortDir} />}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9AA6A3" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text" name="q" defaultValue={q}
            placeholder="ค้นหาชื่อพรอมต์หรือผู้เขียน…"
            style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
              border: "1px solid #E7E3D9", borderRadius: 10, fontSize: 14, outline: "none",
              background: "#fff", color: "#18302D" }}
          />
        </div>
        <button type="submit"
          style={{ background: "#0E9E6E", color: "#fff", borderRadius: 10, padding: "9px 18px",
            fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>
          ค้นหา
        </button>
        {query && (
          <Link href="/admin/prompts"
            style={{ border: "1px solid #E7E3D9", color: "#6B7B78", borderRadius: 10, padding: "9px 14px",
              fontSize: 14, fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            ล้าง
          </Link>
        )}
      </form>

      {/* Search result info */}
      {query && (
        <p className="text-sm" style={{ color: "#6B7B78" }}>
          พบ <strong style={{ color: "#18302D" }}>{filtered.length}</strong> รายการ
          สำหรับ &quot;<strong style={{ color: "#18302D" }}>{q}</strong>&quot;
        </p>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E7E3D9", borderRadius: 18, overflow: "hidden" }}>
        {paged.length === 0 ? (
          <p className="text-center py-14 text-sm" style={{ color: "#9AA6A3" }}>
            {query ? `ไม่พบพรอมต์ที่ตรงกับ "${q}"` : "ยังไม่มีพรอมต์"}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F6F5F0", borderBottom: "1px solid #E7E3D9" }}>
                <SortTh col="title"   label="ชื่อพรอมต์" sortKey={sortKey} sortDir={sortDir} sortUrl={sortUrl} />
                <SortTh col="stage"   label="ขั้นตอน"    sortKey={sortKey} sortDir={sortDir} sortUrl={sortUrl} />
                <Th>ผู้เขียน</Th>
                <Th>วิชา / ระดับ</Th>
                <SortTh col="status"  label="สถานะ"      sortKey={sortKey} sortDir={sortDir} sortUrl={sortUrl} />
                <SortTh col="copies"  label="คัดลอก" align="right" sortKey={sortKey} sortDir={sortDir} sortUrl={sortUrl} />
                <SortTh col="ratings" label="คะแนน"  align="right" sortKey={sortKey} sortDir={sortDir} sortUrl={sortUrl} />
                <Th align="right">จัดการ</Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p, i) => {
                const st = STATUS_CONFIG[p.status];
                return (
                  <tr key={p.id} style={{ borderBottom: i < paged.length - 1 ? "1px solid #F0ECE2" : "none" }}>
                    <td className="px-5 py-3.5 font-medium max-w-[200px] truncate" style={{ color: "#18302D" }}>
                      {p.title}
                    </td>
                    <td className="px-4 py-3.5 font-medium" style={{ color: STAGE_COLORS[p.stage] }}>
                      {STAGE_LABELS[p.stage]}
                    </td>
                    <td className="px-4 py-3.5 text-sm max-w-[130px] truncate" style={{ color: "#6B7B78" }}>
                      {p.createdBy.name ?? p.createdBy.email}
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "#6B7B78" }}>
                      {p.subject} / {p.grade}
                    </td>
                    <td className="px-4 py-3.5">
                      <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 600,
                        borderRadius: 99, padding: "3px 10px", display: "inline-block", whiteSpace: "nowrap" }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm" style={{ color: "#6B7B78" }}>
                      {p.copyCount}
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm" style={{ color: "#6B7B78" }}>
                      {p._count.ratings}
                    </td>
                    <td className="px-4 py-3.5">
                      <AdminPromptActions id={p.id} title={p.title} status={p.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm" style={{ color: "#9AA6A3" }}>
            แสดง {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)}{" "}
            จาก {sorted.length} รายการ
          </p>
          <div className="flex items-center gap-1">
            <PaginationLink href={pageUrl(safePage - 1)} disabled={safePage <= 1} label="←" />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationLink key={p} href={pageUrl(p)} active={p === safePage} label={String(p)} />
            ))}
            <PaginationLink href={pageUrl(safePage + 1)} disabled={safePage >= totalPages} label="→" />
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, align = "left" }: { children?: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th style={{ textAlign: align, padding: "10px 16px", fontWeight: 600, fontSize: 12.5, color: "#6B7B78" }}>
      {children}
    </th>
  );
}

function PaginationLink({ href, label, active = false, disabled = false }:
  { href: string; label: string; active?: boolean; disabled?: boolean }) {
  if (disabled) {
    return (
      <span style={{ padding: "6px 11px", borderRadius: 8, fontSize: 13, fontWeight: 500,
        color: "#C0C8C6", border: "1px solid #E7E3D9", display: "inline-block", lineHeight: 1 }}>
        {label}
      </span>
    );
  }
  return (
    <Link href={href} style={{ padding: "6px 11px", borderRadius: 8, fontSize: 13,
      fontWeight: active ? 700 : 500,
      color: active ? "#fff" : "#18302D",
      background: active ? "#0E9E6E" : "transparent",
      border: `1px solid ${active ? "#0E9E6E" : "#E7E3D9"}`,
      textDecoration: "none", display: "inline-block", lineHeight: 1 }}>
      {label}
    </Link>
  );
}

function SortTh({
  col, label, align = "left", sortKey, sortDir, sortUrl,
}: {
  col: SortKey;
  label: string;
  align?: "left" | "right";
  sortKey: string;
  sortDir: string;
  sortUrl: (key: SortKey) => string;
}) {
  const active = sortKey === col;
  const arrow  = active ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  return (
    <th style={{ textAlign: align, padding: "10px 16px", fontWeight: 600, fontSize: 12.5 }}>
      <Link
        href={sortUrl(col)}
        style={{
          color: active ? "#0E9E6E" : "#6B7B78",
          textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 2,
          userSelect: "none",
        }}
      >
        {label}{arrow}
      </Link>
    </th>
  );
}
