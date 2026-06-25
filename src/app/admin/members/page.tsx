import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const PAGE_SIZE = 20;

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
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { ratings: true, loginLogs: true } },
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold text-gray-800">
          สมาชิกทั้งหมด ({total})
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อ / อีเมล</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">สมัคร</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Login ล่าสุด</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Login</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800 truncate max-w-[160px]">
                    {u.name ?? "-"}
                  </div>
                  <div className="text-xs text-gray-400 truncate max-w-[160px]">{u.email}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === Role.ADMIN
                        ? "bg-gold/10 text-gold"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                  {new Date(u.createdAt).toLocaleDateString("th-TH")}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleDateString("th-TH")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 text-xs">
                  {u._count.loginLogs}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 text-xs">
                  {u._count.ratings}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="text-center text-gray-400 py-10">ยังไม่มีสมาชิก</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/members?page=${p}`}
              className={`px-3 py-1 rounded-lg border ${
                p === page
                  ? "bg-river text-white border-river"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-paper"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
