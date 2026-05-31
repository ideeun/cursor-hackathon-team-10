"use client";

import { MapPin, Sun, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AppHeader() {
  const { profile } = useAuth();

  const displayName = profile?.name ?? "Путешественник";
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 space-y-3 border-b border-sand bg-white/95 px-4 pb-3 pt-5 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="sf-avatar flex h-11 w-11 items-center justify-center rounded-2xl text-lg">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              avatarLetter
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-ink">
              Салам, {displayName}
            </p>
            <p className="text-xs text-ink-light">
              Level {level} ·{" "}
              <span className="font-medium text-peach-deep">{xp} XP</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-peach-soft px-3 py-2">
          <Flame size={14} className="text-peach-deep" strokeWidth={1.75} />
          <span className="text-xs font-semibold text-peach-deep">{level}</span>
        </div>
      </div>

      <div className="sf-card flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-ink-light">
          <MapPin size={15} className="text-peach-muted" strokeWidth={1.75} />
          <span className="font-medium">Бишкек</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <Sun size={15} className="text-peach-muted" strokeWidth={1.75} />
          +32°C, солнечно
        </div>
      </div>
    </header>
  );
}
