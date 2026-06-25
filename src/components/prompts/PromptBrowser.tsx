"use client";

import { useState, useTransition } from "react";
import { Stage } from "@prisma/client";
import { AIPACKHero } from "@/components/layout/AIPACKHero";
import { FilterBar, FilterState } from "@/components/prompts/FilterBar";
import { PromptGrid } from "@/components/prompts/PromptGrid";
import { PromptModal } from "@/components/prompts/PromptModal";
import { PromptCardData } from "@/components/prompts/PromptCard";
import { fetchPrompts } from "@/actions/prompts";

interface PromptBrowserProps {
  initialPrompts: PromptCardData[];
}

const DEFAULT_FILTERS: FilterState = {
  stage: "",
  subject: "",
  grade: "",
  skill: "",
  search: "",
  sort: "newest",
};

export function PromptBrowser({ initialPrompts }: PromptBrowserProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [prompts, setPrompts] = useState<PromptCardData[]>(initialPrompts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    startTransition(async () => {
      const results = await fetchPrompts({
        stage: next.stage || undefined,
        subject: next.subject || undefined,
        grade: next.grade || undefined,
        skill: next.skill || undefined,
        search: next.search || undefined,
        sort: next.sort,
      });
      setPrompts(results);
    });
  };

  const handleStageChange = (stage: Stage | null) => {
    const next: FilterState = { ...filters, stage: stage ?? "" };
    handleFiltersChange(next);
  };

  return (
    <>
      <AIPACKHero
        selectedStage={filters.stage || null}
        onStageChange={handleStageChange}
      />

      <FilterBar filters={filters} onChange={handleFiltersChange} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {isPending ? (
              <span className="animate-pulse">กำลังโหลด...</span>
            ) : (
              <>
                พบ <span className="font-semibold text-river">{prompts.length}</span> พรอมต์
              </>
            )}
          </p>
        </div>

        {/* Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
        >
          <PromptGrid prompts={prompts} onPromptClick={setSelectedId} />
        </div>
      </main>

      {/* Modal */}
      {selectedId && (
        <PromptModal
          promptId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
