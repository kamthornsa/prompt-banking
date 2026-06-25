import { prisma } from "@/lib/prisma";
import { PROTECTED_ADMIN_EMAIL } from "@/lib/constants";
import { Role } from "@prisma/client";
import { promoteToAdmin, demoteAdmin } from "@/actions/admin";

// Void wrappers for form actions
async function handlePromote(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  await promoteToAdmin(userId);
}

async function handleDemote(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  await demoteAdmin(userId);
}

export default async function AdminAdminsPage() {
  const [admins, regularUsers] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true, image: true, createdAt: true, lastLoginAt: true },
    }),
    prisma.user.findMany({
      where: { role: Role.USER },
      orderBy: { lastLoginAt: { sort: "desc", nulls: "last" } },
      take: 50,
      select: { id: true, email: true, name: true, lastLoginAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-serif font-bold text-gray-800">
        จัดการผู้ดูแลระบบ
      </h1>

      {/* Current admins */}
      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700">ผู้ดูแลระบบปัจจุบัน ({admins.length})</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อ / อีเมล</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">เข้าระบบล่าสุด</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{u.name ?? "-"}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("th-TH") : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.email !== PROTECTED_ADMIN_EMAIL && (
                      <form action={handleDemote}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-600 hover:underline"
                        >
                          ลดสิทธิ์
                        </button>
                      </form>
                    )}
                    {u.email === PROTECTED_ADMIN_EMAIL && (
                      <span className="text-xs text-gray-300">ป้องกัน</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Promote user */}
      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700">เพิ่มผู้ดูแล (จากสมาชิกที่เคย login แล้ว)</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อ / อีเมล</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">เข้าระบบล่าสุด</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {regularUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{u.name ?? "-"}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("th-TH") : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={handlePromote}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="text-xs text-river hover:underline font-medium"
                      >
                        ยกระดับเป็น Admin
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {regularUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-6">ยังไม่มีสมาชิก</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
