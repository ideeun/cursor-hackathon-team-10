"use client";

import { Loader2, Users, MapPinned } from "lucide-react";
import { SECRET_EVENT } from "@/lib/activities";
import { useAppData } from "@/contexts/AppDataContext";
import CountdownTimer from "@/components/ui/CountdownTimer";

export default function GatheringsPage() {
  const { gatherings, actionLoading, handleJoinGathering, openGatheringModal } =
    useAppData();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-sky-500" />
          <h2 className="text-base font-bold text-stone-800">Сборы и встречи</h2>
        </div>
        <button
          onClick={() => openGatheringModal()}
          className="rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-sky-600"
        >
          + Создать
        </button>
      </div>

      {gatherings.length === 0 && (
        <p className="rounded-2xl bg-white p-4 text-center text-sm text-stone-500 shadow-sm">
          Сборов пока нет. Нажмите «+» чтобы объявить встречу.
        </p>
      )}

      <div className="space-y-3">
        {gatherings.map((gathering) => (
          <div
            key={gathering.id}
            className={`rounded-3xl border p-4 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${
              gathering.is_secret
                ? "secret-card border-transparent bg-gradient-to-br from-amber-50 to-orange-50"
                : "border-sky-100 bg-white"
            }`}
          >
            <div className="mb-2 flex items-start gap-3">
              <span className="text-3xl">{gathering.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-stone-800">{gathering.title}</h3>
                <p className="mt-0.5 text-xs text-stone-500">
                  Организатор:{" "}
                  <span className="font-semibold text-sky-600">
                    {gathering.host_name}
                  </span>
                </p>
              </div>
            </div>

            {gathering.description && (
              <p className="mb-3 text-xs leading-relaxed text-stone-500">
                {gathering.description}
              </p>
            )}

            {gathering.is_secret && gathering.hidden_location && (
              <div className="mb-3 flex items-center gap-2 rounded-2xl bg-amber-100/80 px-3 py-2 text-xs font-semibold text-amber-800">
                <MapPinned size={13} />
                {gathering.isJoined
                  ? SECRET_EVENT.revealedLocation
                  : gathering.hidden_location}
              </div>
            )}

            {gathering.is_secret && gathering.available_until && (
              <div className="mb-3">
                <CountdownTimer until={gathering.available_until} />
              </div>
            )}

            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                📅 {gathering.date_time}
              </span>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
                👥 Мест: {gathering.spots_left}
              </span>
            </div>

            <button
              onClick={() =>
                handleJoinGathering(gathering.id, gathering.is_secret)
              }
              disabled={
                gathering.isJoined ||
                gathering.spots_left <= 0 ||
                actionLoading === gathering.id
              }
              className={`w-full rounded-2xl py-2.5 text-sm font-bold transition-all duration-300 active:scale-95 ${
                gathering.isJoined
                  ? "cursor-default bg-emerald-100 text-emerald-700"
                  : gathering.spots_left <= 0
                    ? "cursor-not-allowed bg-stone-100 text-stone-400"
                    : gathering.is_secret
                      ? "bg-gradient-to-r from-amber-500 via-red-500 to-yellow-500 text-white shadow-md hover:shadow-lg"
                      : "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {actionLoading === gathering.id ? (
                <Loader2 size={16} className="mx-auto animate-spin" />
              ) : gathering.isJoined ? (
                "Вы идёте! ✅"
              ) : gathering.spots_left <= 0 ? (
                "Мест нет"
              ) : (
                (gathering.join_label ?? "Присоединиться")
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
