"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, NAV_TABS } from "@/lib/nav-tabs";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t border-sand bg-white/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around px-2 py-2.5">
        {NAV_TABS.map((tab) => {
          const active = isNavActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors duration-200 ${
                active ? "text-peach-deep" : "text-ink-faint hover:text-ink-light"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <span className="mt-0.5 h-0.5 w-5 rounded-full bg-peach-muted" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
