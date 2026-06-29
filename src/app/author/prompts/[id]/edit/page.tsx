import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PromptForm } from "@/components/prompts/PromptForm";
import { Role } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AuthorEditPromptPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/?login=required");

  const { id } = await params;
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      text: true,
      stage: true,
      subject: true,
      skill: true,
      grade: true,
      status: true,
      createdById: true,
    },
  });

  if (!prompt) notFound();

  // AUTHOR can only edit their own prompts; ADMIN can edit any
  const role = session.user.role as Role;
  if (role === Role.AUTHOR && prompt.createdById !== session.user.id) {
    redirect("/author/prompts");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/author/prompts"
          className="inline-flex items-center gap-1 text-sm mb-4"
          style={{ color: "#6B7B78", textDecoration: "none" }}
        >
          ← กลับไปยังรายการ
        </Link>
        <h1 className="font-serif font-bold text-[32px] leading-tight" style={{ color: "#18302D" }}>
          แก้ไขพรอมต์
        </h1>
      </div>

      <PromptForm
        promptId={prompt.id}
        redirectTo="/author/prompts"
        initialData={{
          title: prompt.title,
          text: prompt.text,
          stage: prompt.stage,
          subject: prompt.subject,
          skill: prompt.skill,
          grade: prompt.grade,
        }}
      />
    </div>
  );
}
