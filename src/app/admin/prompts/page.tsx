import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePrompt } from "@/actions/prompts";
import { Stage } from "@prisma/client";

const STAGE_LABELS: Record<Stage, string> = {
  DESIGN: "วิเคราะห์",
  MATERIAL: "สร้างสื่อ",
  FACILITATE: "กิจกรรม",
  ASSESS: "ประเมิน",
  REFLECT: "สะท้อนคิด",
};

export default async function AdminPromptsPage() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      stage: true,
      subject: true,
      skill: true,
      grade: true,
      copyCount: true,
      _count: { select: { ratings: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold text-gray-800">
          จัดการพรอมต์ ({prompts.length})
        </h1>
        <Link
          href="/admin/prompts/new"
          className="bg-river hover:bg-river-dark text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          + เพิ่มพรอมต์
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อพรอมต์</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">ขั้นตอน</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">วิชา / ระดับ</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">คัดลอก</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">คะแนน</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prompts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">
                  {p.title}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                  {STAGE_LABELS[p.stage]}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  {p.subject} / {p.grade}
                </td>
                <td className="px-4 py-3 text-center text-gray-500">{p.copyCount}</td>
                <td className="px-4 py-3 text-center text-gray-500">{p._count.ratings}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/admin/prompts/${p.id}/edit`}
                      className="text-xs text-river hover:underline"
                    >
                      แก้ไข
                    </Link>
                    <DeleteButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {prompts.length === 0 && (
          <p className="text-center text-gray-400 py-10">ยังไม่มีพรอมต์</p>
        )}
      </div>
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
      <button type="submit" className="text-xs text-red-400 hover:text-red-600 hover:underline">
        ลบ
      </button>
    </form>
  );
}
