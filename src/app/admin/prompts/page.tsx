import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePrompt, approvePrompt, rejectPrompt } from "@/actions/prompts";
import { Stage, PromptStatus } from "@prisma/client";

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
  PENDING:   { label: "รออนุมัติ",  color: "#B5772A", bg: "#FBEFE0" },
  PUBLISHED: { label: "เผยแพร่",    color: "#0A6B4D", bg: "#E2F4EC" },
  REJECTED:  { label: "ไม่อนุมัติ", color: "#B54B2C", bg: "#FDEEE9" },
};

export default async function AdminPromptsPage() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, stage: true, subject: true, skill: true, grade: true,
      status: true, copyCount: true,
      createdBy: { select: { name: true, email: true } },
      _count: { select: { ratings: true } },
    },
  });

  const pending = prompts.filter((p) => p.status === PromptStatus.PENDING);
  const rest    = prompts.filter((p) => p.status !== PromptStatus.PENDING);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-bold text-[28px]" style={{ color: "#18302D" }}>
          จัดการพรอมต์
          <span className="font-sans font-normal text-[15px] ml-2" style={{ color: "#6B7B78" }}>
            ({prompts.length})
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

      {/* Pending section */}
      {pending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span
              style={{ background: "#B5772A", color: "#fff", fontSize: 12, fontWeight: 700,
                borderRadius: 99, width: 22, height: 22, display: "inline-flex",
                alignItems: "center", justifyContent: "center" }}
            >
              {pending.length}
            </span>
            <span className="font-semibold text-sm" style={{ color: "#B5772A" }}>รออนุมัติ</span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #F0D8B0", borderRadius: 18, overflow: "hidden" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#FEFAF3", borderBottom: "1px solid #F0D8B0" }}>
                  <Th>ชื่อพรอมต์</Th>
                  <Th>ขั้นตอน</Th>
                  <Th>ผู้เขียน</Th>
                  <Th align="right">จัดการ</Th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < pending.length - 1 ? "1px solid #FBF0DC" : "none" }}>
                    <td className="px-5 py-3.5 font-medium max-w-[240px] truncate" style={{ color: "#18302D" }}>
                      {p.title}
                    </td>
                    <td className="px-4 py-3.5 font-medium" style={{ color: STAGE_COLORS[p.stage] }}>
                      {STAGE_LABELS[p.stage]}
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "#6B7B78" }}>
                      {p.createdBy.name ?? p.createdBy.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/prompts/${p.id}/edit`}
                          style={{ border: "1px solid #C8D5D2", color: "#18302D", borderRadius: 8,
                            padding: "4px 12px", fontSize: 12, fontWeight: 500, textDecoration: "none",
                            display: "inline-block" }}
                        >
                          ดู/แก้ไข
                        </Link>
                        <ApproveButton id={p.id} />
                        <RejectButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* All prompts */}
      <section>
        {pending.length > 0 && (
          <h2 className="font-semibold text-sm mb-3" style={{ color: "#6B7B78" }}>
            พรอมต์ทั้งหมด
          </h2>
        )}
        <div style={{ background: "#fff", border: "1px solid #E7E3D9", borderRadius: 18, overflow: "hidden" }}>
          {rest.length === 0 ? (
            <p className="text-center py-14 text-sm" style={{ color: "#9AA6A3" }}>ยังไม่มีพรอมต์</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F6F5F0", borderBottom: "1px solid #E7E3D9" }}>
                  <Th>ชื่อพรอมต์</Th>
                  <Th>ขั้นตอน</Th>
                  <Th>วิชา / ระดับ</Th>
                  <Th>สถานะ</Th>
                  <Th align="right">คัดลอก</Th>
                  <Th align="right">คะแนน</Th>
                  <Th align="right">จัดการ</Th>
                </tr>
              </thead>
              <tbody>
                {rest.map((p, i) => {
                  const st = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} style={{ borderBottom: i < rest.length - 1 ? "1px solid #F0ECE2" : "none" }}>
                      <td className="px-5 py-3.5 font-medium max-w-[220px] truncate" style={{ color: "#18302D" }}>
                        {p.title}
                      </td>
                      <td className="px-4 py-3.5 font-medium" style={{ color: STAGE_COLORS[p.stage] }}>
                        {STAGE_LABELS[p.stage]}
                      </td>
                      <td className="px-4 py-3.5 text-sm" style={{ color: "#6B7B78" }}>
                        {p.subject} / {p.grade}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 600,
                            borderRadius: 99, padding: "3px 10px", display: "inline-block" }}
                        >
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
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/admin/prompts/${p.id}/edit`}
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
      </section>
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

function ApproveButton({ id }: { id: string }) {
  async function handleApprove(formData: FormData) {
    "use server";
    await approvePrompt(formData.get("id") as string);
  }
  return (
    <form action={handleApprove}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        style={{ border: "1px solid #A8DABC", color: "#0A6B4D", borderRadius: 8,
          padding: "4px 12px", fontSize: 12, fontWeight: 600, background: "#E2F4EC", cursor: "pointer" }}
      >
        อนุมัติ
      </button>
    </form>
  );
}

function RejectButton({ id }: { id: string }) {
  async function handleReject(formData: FormData) {
    "use server";
    await rejectPrompt(formData.get("id") as string);
  }
  return (
    <form action={handleReject}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        style={{ border: "1px solid #F4C5BB", color: "#B54B2C", borderRadius: 8,
          padding: "4px 12px", fontSize: 12, fontWeight: 500, background: "transparent", cursor: "pointer" }}
      >
        ไม่อนุมัติ
      </button>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  async function handleDelete(formData: FormData) {
    "use server";
    await deletePrompt(formData.get("id") as string);
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


