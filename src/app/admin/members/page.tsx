import { prisma } from "@/lib/prisma";
import { Role, AuthorRequestStatus } from "@prisma/client";
import { promoteToAuthor, demoteAuthor, approveAuthorRequest, rejectAuthorRequest } from "@/actions/admin";

const PAGE_SIZE = 20;

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
  ADMIN:   { label: "Admin",   color: "#B5772A", bg: "#FBEFE0" },
  AUTHOR:  { label: "Author",  color: "#0A6B4D", bg: "#E2F4EC" },
  USER:    { label: "User",    color: "#6B7B78", bg: "#F0ECE2" },
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminMembersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { lastLoginAt: { sort: "desc", nulls: "last" } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, email: true, name: true, image: true, role: true,
        authorRequestStatus: true, createdAt: true, lastLoginAt: true,
        _count: { select: { ratings: true, loginLogs: true } },
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingRequests = users.filter(
    (u) => u.authorRequestStatus === AuthorRequestStatus.PENDING
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <h1 className="font-serif font-bold text-[28px]" style={{ color: "#18302D" }}>
        สมาชิกทั้งหมด
        <span className="font-sans font-normal text-[15px] ml-2" style={{ color: "#6B7B78" }}>
          ({total})
        </span>
      </h1>

      {/* Pending Author Requests */}
      {pendingRequests.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span
              style={{ background: "#B5772A", color: "#fff", fontSize: 12, fontWeight: 700,
                borderRadius: 99, width: 22, height: 22, display: "inline-flex",
                alignItems: "center", justifyContent: "center" }}
            >
              {pendingRequests.length}
            </span>
            <span className="font-semibold text-sm" style={{ color: "#B5772A" }}>คำขอเป็น Author</span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #F0D8B0", borderRadius: 18, overflow: "hidden" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#FEFAF3", borderBottom: "1px solid #F0D8B0" }}>
                  <Th>ชื่อ / อีเมล</Th>
                  <Th>สมัคร</Th>
                  <Th align="right">จัดการ</Th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < pendingRequests.length - 1 ? "1px solid #FBF0DC" : "none" }}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium" style={{ color: "#18302D" }}>{u.name ?? "-"}</div>
                      <div className="text-xs" style={{ color: "#9AA6A3" }}>{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: "#6B7B78" }}>
                      {new Date(u.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <ApproveRequestButton userId={u.id} />
                        <RejectRequestButton userId={u.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Members table */}
      <div style={{ background: "#fff", border: "1px solid #E7E3D9", borderRadius: 18, overflow: "hidden" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F6F5F0", borderBottom: "1px solid #E7E3D9" }}>
              <Th>ชื่อ / อีเมล</Th>
              <Th>สิทธิ์</Th>
              <Th>สมัคร</Th>
              <Th>Login ล่าสุด</Th>
              <Th align="right">Login</Th>
              <Th align="right">Rating</Th>
              <Th align="right">จัดการ</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const roleCfg = ROLE_CONFIG[u.role];
              return (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #F0ECE2" : "none" }}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium truncate max-w-[160px]" style={{ color: "#18302D" }}>
                      {u.name ?? "-"}
                    </div>
                    <div className="text-xs truncate max-w-[160px]" style={{ color: "#9AA6A3" }}>
                      {u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span
                        style={{ background: roleCfg.bg, color: roleCfg.color, fontSize: 12, fontWeight: 600,
                          borderRadius: 99, padding: "2px 10px", display: "inline-block" }}
                      >
                        {roleCfg.label}
                      </span>
                      {u.authorRequestStatus === AuthorRequestStatus.PENDING && (
                        <span
                          style={{ background: "#FBEFE0", color: "#B5772A", fontSize: 11, fontWeight: 600,
                            borderRadius: 99, padding: "2px 8px", display: "inline-block" }}
                        >
                          ขอ Author
                        </span>
                      )}
                      {u.authorRequestStatus === AuthorRequestStatus.REJECTED && (
                        <span
                          style={{ background: "#FDEEE9", color: "#B54B2C", fontSize: 11, fontWeight: 600,
                            borderRadius: 99, padding: "2px 8px", display: "inline-block" }}
                        >
                          ถูกปฏิเสธ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "#6B7B78" }}>
                    {new Date(u.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "#6B7B78" }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("th-TH") : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm" style={{ color: "#6B7B78" }}>
                    {u._count.loginLogs}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm" style={{ color: "#6B7B78" }}>
                    {u._count.ratings}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      {u.role === Role.USER   && <PromoteAuthorButton userId={u.id} />}
                      {u.role === Role.AUTHOR && <DemoteAuthorButton userId={u.id} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-14 text-sm" style={{ color: "#9AA6A3" }}>ยังไม่มีสมาชิก</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/members?page=${p}`}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                textDecoration: "none",
                background: p === page ? "#0E9E6E" : "#fff",
                color: p === page ? "#fff" : "#6B7B78",
                border: p === page ? "1px solid #0E9E6E" : "1px solid #E7E3D9",
              }}
            >
              {p}
            </a>
          ))}
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

function PromoteAuthorButton({ userId }: { userId: string }) {
  async function handle(formData: FormData) {
    "use server";
    await promoteToAuthor(formData.get("userId") as string);
  }
  return (
    <form action={handle}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        style={{ border: "1px solid #A8DABC", color: "#0A6B4D", borderRadius: 8,
          padding: "4px 12px", fontSize: 12, fontWeight: 500, background: "transparent", cursor: "pointer" }}
      >
        ให้สิทธิ์ Author
      </button>
    </form>
  );
}

function DemoteAuthorButton({ userId }: { userId: string }) {
  async function handle(formData: FormData) {
    "use server";
    await demoteAuthor(formData.get("userId") as string);
  }
  return (
    <form action={handle}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        style={{ border: "1px solid #F4C5BB", color: "#B54B2C", borderRadius: 8,
          padding: "4px 12px", fontSize: 12, fontWeight: 500, background: "transparent", cursor: "pointer" }}
      >
        ถอนสิทธิ์ Author
      </button>
    </form>
  );
}

function ApproveRequestButton({ userId }: { userId: string }) {
  async function handle(formData: FormData) {
    "use server";
    await approveAuthorRequest(formData.get("userId") as string);
  }
  return (
    <form action={handle}>
      <input type="hidden" name="userId" value={userId} />
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

function RejectRequestButton({ userId }: { userId: string }) {
  async function handle(formData: FormData) {
    "use server";
    await rejectAuthorRequest(formData.get("userId") as string);
  }
  return (
    <form action={handle}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        style={{ border: "1px solid #F4C5BB", color: "#B54B2C", borderRadius: 8,
          padding: "4px 12px", fontSize: 12, fontWeight: 500, background: "transparent", cursor: "pointer" }}
      >
        ปฏิเสธ
      </button>
    </form>
  );
}

