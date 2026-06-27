import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Header } from "@/components/layout/Header";

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/?login=required");
  if (session.user.role !== Role.AUTHOR && session.user.role !== Role.ADMIN) redirect("/");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F6F5F0" }}>
      <Header />
      <div className="flex-1 w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  );
}
