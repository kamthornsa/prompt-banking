import { prisma } from "@/lib/prisma";
import { PROTECTED_ADMIN_EMAIL } from "@/lib/constants";
import { Role } from "@prisma/client";
import { promoteToAdmin, demoteAdmin } from "@/actions/admin";

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
      <h1 className="font-serif font-bold text-[28px]" style={{ color: "#18302D" }}>
        จัดการผู้ดูแลระบบ
      </h1>

      {/* Current admins */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm" style={{ color: "#6B7B78" }}>
          ผู้ดูแลระบบปัจจุบัน ({admins.length})
        </h2>
        <div style={{ background: "#fff", border: "1px solid #E7E3D9", borderRadius: 18, overflow: "hidden" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F6F5F0", borderBottom: "1px solid #E7E3D9" }}>
                <Th>ชื่อ / อีเมล</Th>
                <Th>เข้าระบบล่าสุด</Th>
                <Th align="right">จัดการ</Th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < admins.length - 1 ? "1px solid #F0ECE2" : "none" }}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: "#18302D" }}>{u.name ?? "-"}</div>
                    <div className="text-xs" style={{ color: "#9AA6A3" }}>{u.email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "#6B7B78" }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("th-TH") : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {u.email !== PROTECTED_ADMIN_EMAIL ? (
                      <form action={handleDemote}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          style={{ border: "1px solid #F4C5BB", color: "#B54B2C", borderRadius: 8,
                            padding: "4px 12px", fontSize: 12, fontWeight: 500,
                            background: "transparent", cursor: "pointer" }}
                        >
                          ลดสิทธิ์
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs" style={{ color: "#C0C8C6" }}>ป้องกัน</span>
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
        <h2 className="font-semibold text-sm" style={{ color: "#6B7B78" }}>
          เพิ่มผู้ดูแล (จากสมาชิกที่เคย login แล้ว)
        </h2>
        <div style={{ background: "#fff", border: "1px solid #E7E3D9", borderRadius: 18, overflow: "hidden" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F6F5F0", borderBottom: "1px solid #E7E3D9" }}>
                <Th>ชื่อ / อีเมล</Th>
                <Th>เข้าระบบล่าสุด</Th>
                <Th align="right">จัดการ</Th>
              </tr>
            </thead>
            <tbody>
              {regularUsers.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < regularUsers.length - 1 ? "1px solid #F0ECE2" : "none" }}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: "#18302D" }}>{u.name ?? "-"}</div>
                    <div className="text-xs" style={{ color: "#9AA6A3" }}>{u.email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "#6B7B78" }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("th-TH") : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <form action={handlePromote}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        style={{ border: "1px solid #A8DABC", color: "#0A6B4D", borderRadius: 8,
                          padding: "4px 12px", fontSize: 12, fontWeight: 500,
                          background: "transparent", cursor: "pointer" }}
                      >
                        ยกระดับเป็น Admin
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {regularUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-sm" style={{ color: "#9AA6A3" }}>
                    ยังไม่มีสมาชิก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

