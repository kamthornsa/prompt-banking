import { fetchAuthorPrompts } from "@/actions/prompts";
import { deletePrompt } from "@/actions/prompts";
import { PromptStatus, Stage } from "@prisma/client";
import Link from "next/link";
import { AuthorTabBar } from "../AuthorTabBar";

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
  PENDING:   { label: "รออนุมัติ",   color: "#B5772A", bg: "#FBEFE0" },
  PUBLISHED: { label: "เผยแพร่",     color: "#0A6B4D", bg: "#E2F4EC" },
  REJECTED:  { label: "ไม่อนุมัติ",  color: "#B54B2C", bg: "#FDEEE9" },
};

export default async function AuthorPromptsPage() {
  const prompts = await fetchAuthorPrompts();

  const total     = prompts.length;
  const published = prompts.filter((p) => p.status === PromptStatus.PUBLISHED).length;
  const pending   = prompts.filter((p) => p.status === PromptStatus.PENDING).length;

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
            สร้างและจัดการพรอมต์ — พรอมต์ใหม่จะรอแอดมินอนุมัติก่อนเผยแพร่
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
        <StatCard label="รออนุมัติ"    value={pending}  valueColor="#B5772A" />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E7E3D9", borderRadius: 18, overflow: "hidden" }}>
        {prompts.length === 0 ? (
          <p className="text-center py-14 text-sm" style={{ color: "#9AA6A3" }}>
            ยังไม่มีพรอมต์ — กด &quot;+ สร้างพรอมต์ใหม่&quot; เพื่อเริ่ม
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
              {prompts.map((p, i) => {
                const st = STATUS_CONFIG[p.status];
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: i < prompts.length - 1 ? "1px solid #F0ECE2" : "none" }}
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
