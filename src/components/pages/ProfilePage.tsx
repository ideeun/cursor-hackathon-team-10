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
    <section className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-md lg:mx-auto lg:max-w-xl lg:p-10">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-2xl font-bold text-white">
        {avatarLetter}
      </div>
      <h3 className="text-lg font-bold text-stone-800">{displayName}</h3>
      <p className="text-sm text-stone-500">Level {level} Explorer</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "XP", value: String(xp) },
          { label: "Челленджи", value: String(participantCount) },
          { label: "Сборы", value: String(joinedGatherings) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-orange-50 py-3">
            <p className="text-lg font-black text-orange-600">{stat.value}</p>
            <p className="text-[10px] text-stone-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => signOut()}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 py-3 text-sm font-semibold text-stone-600 transition-all duration-300 hover:bg-stone-50"
      >
        <LogOut size={16} />
        Выйти
      </button>
    </section>
  );
}
