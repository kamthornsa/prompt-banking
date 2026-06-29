import { fetchAuthorPrompts } from "@/actions/prompts";
import { deletePrompt } from "@/actions/prompts";
import { PromptStatus, Stage } from "@prisma/client";
import Link from "next/link";
import { AuthorTabBar } from "../AuthorTabBar";

const PAGE_SIZE = 10;

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
  REJECTED:  { label: "ถูกซ่อน",            color: "#B54B2C", bg: "#FDEEE9" },
};

export default async function AuthorPromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const allPrompts = await fetchAuthorPrompts();

  // Stats always based on all prompts
  const total     = allPrompts.length;
  const published = allPrompts.filter((p) => p.status === PromptStatus.PUBLISHED).length;
  const hidden    = allPrompts.filter((p) => p.status === PromptStatus.REJECTED).length;

  // Filter by search query
  const query = q.trim().toLowerCase();
  const filtered = query
    ? allPrompts.filter((p) => p.title.toLowerCase().includes(query))
    : allPrompts;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/author/prompts${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <AuthorTabBar />

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-[36px] leading-tight" style={{ color: "#18302D" }}>
            พรอมต์ของฉัน
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7B78" }}>
            สร้างและจัดการพรอมต์ — พรอมต์ใหม่จะเผยแพร่ทันที แอดมินสามารถซ่อนได้ในภายหลัง
          </p>
        </div>
        <Link
          href="/author/prompts/new"
          style={{ background: "#0E9E6E", color: "#fff", borderRadius: 12, padding: "10px 20px",
            fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", flexShrink: 0,
            display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          + สร้างพรอมต์ใหม่
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="พรอมต์ทั้งหมด" value={total} />
        <StatCard label="เผยแพร่แล้ว"  value={published} />
        <StatCard label="ถูกซ่อน"       value={hidden}   valueColor="#B54B2C" />
      </div>

      {/* Search bar */}
      <form method="GET" action="/author/prompts" className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#9AA6A3" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="ค้นหาชื่อพรอมต์…"
            style={{
              width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
              border: "1px solid #E7E3D9", borderRadius: 10, fontSize: 14, outline: "none",
              background: "#fff", color: "#18302D",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            background: "#0E9E6E", color: "#fff", borderRadius: 10, padding: "9px 18px",
            fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer",
          }}
        >
          ค้นหา
        </button>
        {query && (
          <Link
            href="/author/prompts"
            style={{
              border: "1px solid #E7E3D9", color: "#6B7B78", borderRadius: 10, padding: "9px 14px",
              fontSize: 14, fontWeight: 500, textDecoration: "none", display: "inline-flex",
              alignItems: "center",
            }}
          >
            ล้าง
          </Link>
        )}
      </form>

      {/* Search result count */}
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
            {query
              ? `ไม่พบพรอมต์ที่ตรงกับ "${q}"`
              : `ยังไม่มีพรอมต์ — กด "+ สร้างพรอมต์ใหม่" เพื่อเริ่ม`}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F6F5F0", borderBottom: "1px solid #E7E3D9" }}>
                <Th>ชื่อพรอมต์</Th>
                <Th>ขั้นตอน</Th>
                <Th>คะแนน</Th>
                <Th>คัดลอก</Th>
                <Th>สถานะ</Th>
                <Th align="right">จัดการ</Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p, i) => {
                const st = STATUS_CONFIG[p.status];
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: i < paged.length - 1 ? "1px solid #F0ECE2" : "none" }}
                  >
                    <td className="px-5 py-3.5 font-medium max-w-[260px] truncate" style={{ color: "#18302D" }}>
                      {p.title}
                    </td>
                    <td className="px-4 py-3.5 font-medium" style={{ color: STAGE_COLORS[p.stage] }}>
                      {STAGE_LABELS[p.stage]}
                    </td>
                    <td className="px-4 py-3.5" style={{ color: "#6B7B78" }}>
                      {p.avgRating !== null ? (
                        <span className="flex items-center gap-1">
                          <span style={{ color: "#E8A020" }}>★</span>
                          {p.avgRating.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: "#C0C8C6" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5" style={{ color: "#6B7B78" }}>
                      {p.copyCount}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 600,
                          borderRadius: 99, padding: "3px 10px", display: "inline-block" }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/author/prompts/${p.id}/edit`}
                          style={{ border: "1px solid #C8D5D2", color: "#18302D", borderRadius: 8,
                            padding: "4px 12px", fontSize: 12, fontWeight: 500, textDecoration: "none",
                            display: "inline-block" }}
                        >
                          แก้ไข
                        </Link>
                        <DeleteButton id={p.id} />
                      </div>
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
            แสดง {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}{" "}
            จาก {filtered.length} รายการ
          </p>
          <div className="flex items-center gap-1">
            <PaginationLink href={pageUrl(safePage - 1)} disabled={safePage <= 1} label="←" />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationLink
                key={p}
                href={pageUrl(p)}
                active={p === safePage}
                label={String(p)}
              />
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
    <th
      style={{ textAlign: align, padding: "10px 16px", fontWeight: 600, fontSize: 12.5, color: "#6B7B78" }}
    >
      {children}
    </th>
  );
}

function StatCard({ label, value, valueColor = "#18302D" }: {
  label: string; value: number; valueColor?: string;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E7E3D9", borderRadius: 16, padding: "20px 24px" }}>
      <p className="text-sm" style={{ color: "#6B7B78", marginBottom: 8 }}>{label}</p>
      <p className="font-serif font-bold text-[32px]" style={{ color: valueColor, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

function PaginationLink({
  href, label, active = false, disabled = false,
}: { href: string; label: string; active?: boolean; disabled?: boolean }) {
  if (disabled) {
    return (
      <span
        style={{
          padding: "6px 11px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          color: "#C0C8C6", border: "1px solid #E7E3D9", display: "inline-block", lineHeight: 1,
        }}
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      style={{
        padding: "6px 11px", borderRadius: 8, fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? "#fff" : "#18302D",
        background: active ? "#0E9E6E" : "transparent",
        border: `1px solid ${active ? "#0E9E6E" : "#E7E3D9"}`,
        textDecoration: "none", display: "inline-block", lineHeight: 1,
      }}
    >
      {label}
    </Link>
  );
}

function DeleteButton({ id }: { id: string }) {
  async function handleDelete(formData: FormData) {
    "use server";
    const promptId = formData.get("id") as string;
    await deletePrompt(promptId);
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        style={{ border: "1px solid #F4C5BB", color: "#B54B2C", borderRadius: 8,
          padding: "4px 12px", fontSize: 12, fontWeight: 500, background: "transparent", cursor: "pointer" }}
      >
        ลบ
      </button>
    </form>
  );
}
