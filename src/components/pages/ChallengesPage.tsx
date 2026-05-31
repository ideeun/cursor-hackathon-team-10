"use client";

import { Loader2, Trophy } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";
import ProgressBar from "@/components/ui/ProgressBar";

export default function ChallengesPage() {
  const { challenges, actionLoading, handleJoinChallenge, openChallengeModal } =
    useAppData();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between lg:justify-end">
        <div className="flex items-center gap-2 lg:hidden">
          <Trophy size={18} className="text-emerald-500" />
          <h2 className="text-base font-bold text-stone-800">
            Летние челленджи
          </h2>
        </div>
        <button
          onClick={() => openChallengeModal()}
          className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-600"
        >
          + Создать
        </button>
      </div>

      {challenges.length === 0 && (
        <p className="rounded-2xl bg-white p-4 text-center text-sm text-stone-500 shadow-sm">
          Челленджей пока нет. Нажмите «+» или добавьте активность с главной.
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:pb-0 xl:grid-cols-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="w-72 shrink-0 snap-start rounded-3xl border border-emerald-100 bg-white p-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg lg:w-auto"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{challenge.emoji}</span>
              <h3 className="text-sm font-bold text-stone-800">
                {challenge.title}
              </h3>
            </div>

            {challenge.type === "progress" && (
              <ProgressBar
                current={challenge.current_progress ?? 0}
                target={challenge.target ?? 100}
              />
            )}

            {challenge.type === "leaderboard" && challenge.leaderboard && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Лидерборд
                </p>
                {challenge.leaderboard.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between rounded-xl bg-stone-50 px-2.5 py-1.5 text-xs text-stone-600"
                  >
                    <span>
                      #{entry.rank} {entry.name}
                    </span>
                    <span>{entry.value}</span>
                  </div>
                ))}
              </div>
            )}

            {challenge.type === "status" && challenge.status === "completed" && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5">
                <span className="text-lg">✅</span>
                <span className="text-sm font-bold text-emerald-700">
                  Выполнено!
                </span>
              </div>
            )}

            {!challenge.isParticipant && challenge.status !== "completed" && (
              <button
                onClick={() => handleJoinChallenge(challenge.id)}
                disabled={actionLoading === challenge.id}
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 py-2 text-xs font-bold text-white shadow transition-all duration-300 hover:shadow-md active:scale-95 disabled:opacity-70"
              >
                {actionLoading === challenge.id ? (
                  <Loader2 size={14} className="mx-auto animate-spin" />
                ) : (
                  "Участвовать"
                )}
              </button>
            )}

            {challenge.isParticipant && challenge.status !== "completed" && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-amber-50 py-2 text-xs font-bold text-amber-700">
                <Loader2 size={12} className="animate-spin" />
                Вы участвуете
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
