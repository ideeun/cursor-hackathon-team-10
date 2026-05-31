"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { use } from "react";

const QuestActiveView = dynamic(
  () => import("@/components/quests/QuestActiveView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-peach-muted" />
      </div>
    ),
  }
);

export default function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <QuestActiveView questId={id} />;
}
