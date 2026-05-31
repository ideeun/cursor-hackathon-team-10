"use client";

import { usePathname } from "next/navigation";
import { MapPin, Sun } from "lucide-react";
import { getPageTitle } from "@/lib/nav-tabs";

export default function DesktopHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 hidden border-b border-sand bg-white/95 px-10 py-6 backdrop-blur-md lg:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-1 text-sm text-ink-light">
            SummerFlow — ивенты, челленджи и сборы
          </p>
        </div>
        <div className="sf-card flex items-center gap-4 px-5 py-2.5">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-light">
            <MapPin size={16} className="text-peach-muted" strokeWidth={1.75} />
            Бишкек
          </span>
          <span className="h-4 w-px bg-sand" />
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
            <Sun size={16} className="text-peach-muted" strokeWidth={1.75} />
            +32°C, солнечно
          </span>
        </div>
      </div>
    </header>
  );
}
