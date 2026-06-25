import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PromptForm } from "@/components/prompts/PromptForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPromptPage({ params }: Props) {
  const { id } = await params;
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: { id: true, title: true, text: true, stage: true, subject: true, skill: true, grade: true },
  });

  if (!prompt) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-serif font-bold text-gray-800">แก้ไขพรอมต์</h1>
      <PromptForm
        promptId={prompt.id}
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
