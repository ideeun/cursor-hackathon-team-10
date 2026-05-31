"use client";

import { usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";
import DesktopHeader from "@/components/layout/DesktopHeader";
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
    <div className="sf-page min-h-dvh lg:flex">
      <Sidebar />

      <div className="flex min-h-dvh flex-1 flex-col">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col lg:mx-0 lg:max-w-none">
          <AppHeader />
          <DesktopHeader />

          {actionError && (
            <div className="sf-error mx-4 mt-2 flex items-start gap-2 px-3 py-2.5 text-xs lg:mx-8 lg:mt-4 lg:max-w-6xl lg:self-center lg:w-full">
              <p className="flex-1">{actionError}</p>
              <button
                onClick={clearActionError}
                className="shrink-0 rounded-full p-0.5 opacity-70 hover:opacity-100"
                aria-label="Закрыть"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <main className="flex-1 overflow-y-auto px-4 pb-28 pt-2 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-10 lg:pb-10 lg:pt-8">
            {children}
          </main>

          {showGatheringFab && (
            <button
              onClick={() => openGatheringModal()}
              className="sf-fab fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full lg:bottom-8 lg:right-10"
              aria-label="Объявить сбор"
            >
              <Plus size={26} strokeWidth={2} />
            </button>
          )}

          {showChallengeFab && (
            <button
              onClick={() => openChallengeModal()}
              className="sf-fab fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full lg:bottom-8 lg:right-10"
              aria-label="Создать челлендж"
            >
              <Plus size={26} strokeWidth={2} />
            </button>
          )}

          <GatheringModal />
          <ChallengeModal />
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
