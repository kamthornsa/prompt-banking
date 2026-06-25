import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PromptBrowser } from "@/components/prompts/PromptBrowser";
import { fetchPrompts } from "@/actions/prompts";

export default async function HomePage() {
  const initialPrompts = await fetchPrompts({ sort: "newest" });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PromptBrowser initialPrompts={initialPrompts} />
      <Footer />
    </div>
  );
}
