import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchMyProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Header } from "@/components/layout/Header";

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/?login=required");

  const profile = await fetchMyProfile();
  if (!profile) redirect("/");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F6F5F0" }}>
      <Header />
      <div className="flex-1 w-full max-w-[640px] mx-auto px-4 sm:px-6 py-8">
        <h1
          className="font-serif text-2xl font-bold mb-1"
          style={{ color: "#18302D" }}
        >
          ตั้งค่าโปรไฟล์
        </h1>
        <p className="text-sm mb-6" style={{ color: "#6B7B78" }}>
          ข้อมูลนี้แสดงในหน้าโปรไฟล์สาธารณะของคุณ
        </p>
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
