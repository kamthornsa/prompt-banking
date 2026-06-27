import { PromptForm } from "@/components/prompts/PromptForm";

export default function AuthorNewPromptPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-serif font-bold text-gray-800">เพิ่มพรอมต์ใหม่</h1>
      <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
        พรอมต์ที่สร้างจะอยู่ในสถานะ <strong>รออนุมัติ</strong> จนกว่า Admin จะตรวจสอบและอนุมัติ
      </p>
      <PromptForm redirectTo="/author/prompts" />
    </div>
  );
}
