import { PromptForm } from "@/components/prompts/PromptForm";

export default function NewPromptPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-serif font-bold text-gray-800">เพิ่มพรอมต์ใหม่</h1>
      <PromptForm />
    </div>
  );
}
