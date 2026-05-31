"use client";

import { usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import AppHeader from "@/components/layout/AppHeader";
import GatheringModal from "@/components/GatheringModal";
import ChallengeModal from "@/components/ChallengeModal";
import { useAppData } from "@/contexts/AppDataContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openGatheringModal, openChallengeModal, actionError, clearActionError } =
    useAppData();

  const showGatheringFab = pathname === "/gatherings";
  const showChallengeFab = pathname === "/challenges";

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-gradient-to-b from-orange-50 via-amber-50/30 to-sky-50 shadow-2xl">
      <AppHeader />

      {actionError && (
        <div className="mx-4 mt-2 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <p className="flex-1">{actionError}</p>
          <button
            onClick={clearActionError}
            className="shrink-0 rounded-full p-0.5 hover:bg-red-100"
            aria-label="Закрыть"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-2">{children}</main>

      {showGatheringFab && (
        <button
          onClick={() => openGatheringModal()}
          className="fixed bottom-20 right-[calc(50%-11rem)] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-orange-300/50 active:scale-95 md:right-auto md:translate-x-[calc(min(50vw,224px)-3.5rem)]"
          aria-label="Объявить сбор"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {showChallengeFab && (
        <button
          onClick={() => openChallengeModal()}
          className="fixed bottom-20 right-[calc(50%-11rem)] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 md:right-auto md:translate-x-[calc(min(50vw,224px)-3.5rem)]"
          aria-label="Создать челлендж"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      <GatheringModal />
      <ChallengeModal />
      <BottomNav />
    </div>
  );
}
