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
    <header className="sticky top-0 z-30 space-y-3 bg-gradient-to-b from-orange-50/95 to-amber-50/80 px-4 pb-3 pt-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-lg font-bold text-white shadow-lg">
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
            <p className="text-sm font-bold text-stone-800">
              Салам, {displayName}! 👋
            </p>
            <p className="text-xs text-stone-500">
              Level {level} Explorer ·{" "}
              <span className="font-semibold text-orange-500">{xp} XP</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-2xl bg-white/80 px-3 py-2 shadow-md">
          <Flame size={14} className="text-orange-500" />
          <span className="text-xs font-bold text-orange-600">{level}</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <MapPin size={15} className="text-sky-500" />
          <span className="font-medium">Бишкек</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
          <Sun size={15} className="text-amber-500" />
          +32°C, Солнечно ☀️
        </div>
      </div>
    </header>
  );
}
