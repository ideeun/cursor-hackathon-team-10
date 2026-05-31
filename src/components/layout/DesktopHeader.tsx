"use client";

import { usePathname } from "next/navigation";
import { MapPin, Sun } from "lucide-react";
import { getPageTitle } from "@/lib/nav-tabs";

export default function DesktopHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 hidden border-b border-orange-100/60 bg-white/50 px-8 py-5 backdrop-blur-xl lg:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">{title}</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            SummerFlow — активности, челленджи и сборы
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white/80 px-5 py-2.5 shadow-sm">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-stone-600">
            <MapPin size={16} className="text-sky-500" />
            Бишкек
          </span>
          <span className="h-4 w-px bg-stone-200" />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
            <Sun size={16} className="text-amber-500" />
            +32°C, Солнечно
          </span>
        </div>
      </div>
    </header>
  );
}
