"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";
import FriendsSection from "@/components/profile/FriendsSection";

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const { participantCount, joinedGatherings } = useAppData();

  const displayName = profile?.name ?? "Путешественник";
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const friendsCount = profile?.friends?.length ?? 0;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <section className="mx-auto max-w-xl">
      <div className="sf-card p-8 text-center lg:p-10">
        <div className="sf-avatar mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl">
          {avatarLetter}
        </div>
        <h3 className="text-lg font-semibold text-ink">{displayName}</h3>
        <p className="text-sm text-ink-light">Level {level} Explorer</p>
        <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "XP", value: String(xp) },
            { label: "Друзья", value: String(friendsCount) },
            { label: "Челленджи", value: String(participantCount) },
            { label: "Сборы", value: String(joinedGatherings) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-peach-soft/80 py-3 sm:py-4">
              <p className="text-base font-semibold text-peach-deep sm:text-lg">
                {stat.value}
              </p>
              <p className="text-[9px] text-ink-light sm:text-[10px]">{stat.label}</p>
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
      </div>

      <FriendsSection />
    </section>
  );
}
