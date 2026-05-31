"use client";

import { MapPin, Trophy, Users } from "lucide-react";
import type { QuestDoc } from "@/lib/types";
import QuestMapPreview from "@/components/quests/QuestMapPreview";

interface QuestCardProps {
  quest: { id: string } & QuestDoc;
  uid: string;
  onClick: () => void;
}

function statusLabel(status: QuestDoc["status"]) {
  if (status === "completed") return { text: "Готово", className: "bg-emerald-50 text-emerald-700" };
  if (status === "active") return { text: "Идёт", className: "bg-peach-soft text-peach-deep" };
  return { text: "Ждём друзей", className: "bg-stone-100 text-ink-light" };
}

export default function QuestCard({ quest, uid, onClick }: QuestCardProps) {
  const myProgress = quest.participantProgress[uid];
  const completed = myProgress?.completedCount ?? 0;
  const total = quest.checkpoints.length;
  const isDone = !!myProgress?.finishedAt;
  const progressPct = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
  const status = statusLabel(quest.status);

  const currentCheckpoint =
    quest.checkpoints[myProgress?.currentCheckpoint ?? 0] ?? quest.checkpoints[0];

  const participants = quest.participants.map((pid) => ({
    id: pid,
    name: quest.participantNames[pid] ?? "Игрок",
    progress: quest.participantProgress[pid],
  }));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="sf-card sf-card-hover group w-full cursor-pointer overflow-hidden text-left transition-transform duration-200 hover:scale-[1.01]"
    >
      <div className="relative h-44 w-full overflow-hidden bg-stone-100 sm:h-52">
        <QuestMapPreview checkpoints={quest.checkpoints} className="h-44 sm:h-52" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/45 to-transparent px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${status.className}`}
          >
            {status.text}
          </span>
        </div>
        {currentCheckpoint && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/80">
              {isDone ? "Квест пройден" : `Точка ${Math.min(completed + 1, total)} из ${total}`}
            </p>
            <p className="truncate text-sm font-medium text-white">
              {isDone ? quest.title : currentCheckpoint.title}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold leading-snug text-ink">
            {quest.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-light">
            <MapPin size={14} className="shrink-0 text-peach-muted" />
            {quest.district} · {total} точек маршрута
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-ink-light">
              <Users size={14} className="text-peach-muted" />
              Участники
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-peach-deep">
              <Trophy size={13} />
              {isDone ? "Пройден!" : `${completed}/${total}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {participants.slice(0, 5).map((p) => {
                const done = !!p.progress?.finishedAt;
                return (
                  <span
                    key={p.id}
                    title={p.name}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-semibold shadow-sm ${
                      done
                        ? "bg-emerald-100 text-emerald-700"
                        : p.id === uid
                          ? "bg-peach-muted text-white"
                          : "bg-stone-200 text-ink"
                    }`}
                  >
                    {p.name.charAt(0).toUpperCase()}
                    {done && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white">
                        ✓
                      </span>
                    )}
                  </span>
                );
              })}
              {participants.length > 5 && (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-stone-100 text-[10px] font-semibold text-ink-light">
                  +{participants.length - 5}
                </span>
              )}
            </div>
            <p className="min-w-0 flex-1 truncate text-sm text-ink-light">
              {participants.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-faint">
            <span>Прогресс</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-peach-muted to-peach-deep transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
