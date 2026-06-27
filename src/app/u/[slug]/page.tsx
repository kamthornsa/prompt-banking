import { notFound } from "next/navigation";
import { fetchPublicProfile } from "@/actions/profile";
import { Header } from "@/components/layout/Header";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await fetchPublicProfile(slug);
  if (!profile) notFound();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F6F5F0" }}>
      <Header />
      <ProfilePageClient profile={profile} />
    </div>
  );
}
