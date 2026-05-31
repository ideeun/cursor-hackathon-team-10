"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import AppHeader from "@/components/layout/AppHeader";
import GatheringModal from "@/components/GatheringModal";
import { useAppData } from "@/contexts/AppDataContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openGatheringModal } = useAppData();

  const showFab = pathname === "/gatherings";

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-gradient-to-b from-orange-50 via-amber-50/30 to-sky-50 shadow-2xl">
      <AppHeader />
      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-2">{children}</main>

      {showFab && (
        <button
          onClick={() => openGatheringModal()}
          className="fixed bottom-20 right-[calc(50%-11rem)] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-orange-300/50 active:scale-95 md:right-auto md:translate-x-[calc(min(50vw,224px)-3.5rem)]"
          aria-label="Объявить сбор"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      <GatheringModal />
      <BottomNav />
    </div>
  );
}
