"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Users, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/challenges", label: "Челленджи", icon: Trophy },
  { href: "/gatherings", label: "Сборы", icon: Users },
  { href: "/profile", label: "Профиль", icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky bottom-0 z-40 border-t border-orange-100/80 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 transition-all duration-300 ${
                active ? "text-orange-500" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <span
                className={`transition-transform duration-300 ${
                  active ? "scale-110" : ""
                }`}
              >
                <Icon size={20} />
              </span>
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {active && (
                <span className="h-0.5 w-4 rounded-full bg-orange-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
