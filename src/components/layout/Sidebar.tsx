"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, MapPin, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isNavActive, NAV_TABS } from "@/lib/nav-tabs";

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const displayName = profile?.name ?? "Путешественник";
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-orange-100/80 lg:bg-white/60 lg:backdrop-blur-xl xl:w-72">
      <div className="border-b border-orange-100/60 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-md">
            <Sun size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-stone-800">
              SummerFlow
            </p>
            <p className="text-[11px] text-stone-500">Лето без скуки</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_TABS.map((tab) => {
          const active = isNavActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200/50"
                  : "text-stone-600 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-3 rounded-2xl bg-gradient-to-br from-sky-50 to-amber-50 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-stone-600">
            <MapPin size={14} className="text-sky-500" />
            Бишкек
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
            <Sun size={14} className="text-amber-500" />
            +32°C ☀️
          </span>
        </div>
      </div>

      <div className="border-t border-orange-100/60 p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-orange-50/80"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-sm font-bold text-white">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              avatarLetter
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-stone-800">
              {displayName}
            </p>
            <p className="text-xs text-stone-500">
              Level {level} ·{" "}
              <span className="font-semibold text-orange-500">{xp} XP</span>
            </p>
          </div>
          <div className="flex items-center gap-0.5 rounded-xl bg-orange-100 px-2 py-1">
            <Flame size={12} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{level}</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
