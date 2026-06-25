"use client";

import { PromptCard, PromptCardData } from "./PromptCard";

interface PromptGridProps {
  prompts: PromptCardData[];
  onPromptClick: (id: string) => void;
}

export function PromptGrid({ prompts, onPromptClick }: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <div className="col-span-full text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-medium">ไม่พบพรอมต์ที่ตรงกับเงื่อนไข</p>
        <p className="text-sm mt-1">ลองปรับตัวกรองหรือคำค้นหาใหม่</p>
      </div>
    );
  }

  return (
    <>
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} onClick={onPromptClick} />
      ))}
    </>
  );
}

