"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const { participantCount, joinedGatherings } = useAppData();

  const displayName = profile?.name ?? "Путешественник";
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <section className="sf-card mx-auto max-w-xl p-8 text-center lg:p-10">
      <div className="sf-avatar mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl">
        {avatarLetter}
      </div>
      <h3 className="text-lg font-semibold text-ink">{displayName}</h3>
      <p className="text-sm text-ink-light">Level {level} Explorer</p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "XP", value: String(xp) },
          { label: "Челленджи", value: String(participantCount) },
          { label: "Сборы", value: String(joinedGatherings) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-peach-soft/80 py-4">
            <p className="text-lg font-semibold text-peach-deep">{stat.value}</p>
            <p className="text-[10px] text-ink-light">{stat.label}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => signOut()}
        className="sf-btn-ghost mt-6 flex w-full items-center justify-center gap-2 py-3 text-sm"
      >
        <LogOut size={16} strokeWidth={1.75} />
        Выйти
      </button>
    </section>
  );
}
