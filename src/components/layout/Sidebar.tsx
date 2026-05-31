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
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-sand lg:bg-white xl:w-72">
      <div className="border-b border-sand/60 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="sf-avatar flex h-10 w-10 items-center justify-center rounded-2xl">
            <Sun size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">
              SummerFlow
            </p>
            <p className="text-[11px] text-ink-light">Лето без скуки</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-5">
        {NAV_TABS.map((tab) => {
          const active = isNavActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "sf-nav-active"
                  : "text-ink-light hover:bg-orange-100/80 hover:text-peach-deep"
              }`}
            >
              <Icon size={19} strokeWidth={active ? 2.25 : 1.75} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-3 rounded-xl bg-stone-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-ink-light">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <MapPin size={14} className="text-peach-muted" strokeWidth={1.75} />
            Бишкек
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-ink">
            <Sun size={14} className="text-peach-muted" strokeWidth={1.75} />
            +32°C
          </span>
        </div>
      </div>

      <div className="border-t border-sand/60 p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-peach-soft/50"
        >
          <div className="sf-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm">
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
            <p className="truncate text-sm font-medium text-ink">
              {displayName}
            </p>
            <p className="text-xs text-ink-light">
              Level {level} ·{" "}
              <span className="font-medium text-peach-deep">{xp} XP</span>
            </p>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg bg-peach-soft px-2 py-1">
            <Flame size={12} className="text-peach-deep" strokeWidth={1.75} />
            <span className="text-xs font-semibold text-peach-deep">{level}</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
