"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const QuestsPage = dynamic(() => import("@/components/pages/QuestsPage"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-peach-muted" />
    </div>
  ),
});

export default function Page() {
  return <QuestsPage />;
}
