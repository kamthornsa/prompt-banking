import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
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
    <div className="space-y-4">
      <h1 className="text-xl font-serif font-bold text-gray-800">แก้ไขพรอมต์</h1>
      {prompt.status === "PUBLISHED" && (
        <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          พรอมต์นี้เผยแพร่อยู่แล้ว การแก้ไขจะทำให้กลับสู่สถานะ <strong>รออนุมัติ</strong> อีกครั้ง
        </p>
      )}
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
