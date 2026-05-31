"use client";

import { Loader2, Trophy } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";
import ProgressBar from "@/components/ui/ProgressBar";

export default function ChallengesPage() {
  const { challenges, actionLoading, handleJoinChallenge, openChallengeModal } =
    useAppData();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between lg:justify-end">
        <div className="flex items-center gap-2 lg:hidden">
          <Trophy size={18} className="text-peach-muted" strokeWidth={1.75} />
          <h2 className="text-base font-semibold text-ink">Летние челленджи</h2>
        </div>
        <button
          onClick={() => openChallengeModal()}
          className="sf-btn-primary px-4 py-2 text-xs"
        >
          + Создать
        </button>
      </div>

      {challenges.length === 0 && (
        <p className="sf-card px-4 py-8 text-center text-sm text-ink-light">
          Челленджей пока нет. Нажмите «+» или добавьте ивент с главной.
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:pb-0 xl:grid-cols-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="sf-card sf-card-hover w-72 shrink-0 snap-start p-4 lg:w-auto"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{challenge.emoji}</span>
              <h3 className="text-sm font-medium text-ink">{challenge.title}</h3>
            </div>

            {challenge.description && (
              <p className="mb-3 whitespace-pre-line text-xs leading-relaxed text-ink-light">
                {challenge.description}
              </p>
            )}

            {challenge.type === "progress" && (
              <ProgressBar
                current={challenge.current_progress ?? 0}
                target={challenge.target ?? 100}
              />
            )}

            {challenge.type === "leaderboard" && challenge.leaderboard && (
              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                  Лидерборд
                </p>
                {challenge.leaderboard.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between rounded-lg bg-stone-50 px-2.5 py-1.5 text-xs text-ink-light"
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
              <div className="flex items-center gap-2 rounded-xl bg-peach-soft px-3 py-2.5">
                <span className="text-lg">✓</span>
                <span className="text-sm font-medium text-peach-deep">
                  Выполнено
                </span>
              </div>
            )}

            {!challenge.isParticipant && challenge.status !== "completed" && (
              <button
                onClick={() => handleJoinChallenge(challenge.id)}
                disabled={actionLoading === challenge.id}
                className="sf-btn-primary mt-3 w-full py-2 text-xs disabled:opacity-70"
              >
                {actionLoading === challenge.id ? (
                  <Loader2 size={14} className="mx-auto animate-spin" />
                ) : (
                  "Участвовать"
                )}
              </button>
            )}

            {challenge.isParticipant && challenge.status !== "completed" && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-peach-soft py-2 text-xs font-medium text-peach-deep">
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
