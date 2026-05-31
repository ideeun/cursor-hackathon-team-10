"use client";

import { Loader2, Mail, UserCheck, Users, MapPinned } from "lucide-react";
import { SECRET_EVENT } from "@/lib/activities";
import { useAuth } from "@/contexts/AuthContext";
import { useAppData } from "@/contexts/AppDataContext";
import CountdownTimer from "@/components/ui/CountdownTimer";
import type { GatheringDoc } from "@/lib/types";

function getGuestAttendees(
  gathering: GatheringDoc & { id: string }
): { uid: string; name: string; email?: string }[] {
  return gathering.attendees
    .filter((id) => id !== gathering.host_id)
    .map((id) => ({
      uid: id,
      name: gathering.attendeeNames?.[id] ?? "Участник",
      email: gathering.attendeeEmails?.[id],
    }));
}

export default function GatheringsPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const { gatherings, actionLoading, handleJoinGathering, openGatheringModal } =
    useAppData();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between lg:justify-end">
        <div className="flex items-center gap-2 lg:hidden">
          <Users size={18} className="text-peach-muted" strokeWidth={1.75} />
          <h2 className="text-base font-semibold text-ink">Сборы и встречи</h2>
        </div>
        <button
          onClick={() => openGatheringModal()}
          className="sf-btn-primary px-4 py-2 text-xs"
        >
          + Создать
        </button>
      </div>

      {gatherings.length === 0 && (
        <p className="sf-card px-4 py-8 text-center text-sm text-ink-light">
          Сборов пока нет. Нажмите «+», чтобы объявить встречу.
        </p>
      )}

      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
        {gatherings.map((gathering) => {
          const isHost = uid === gathering.host_id;
          const guests = getGuestAttendees(gathering);

          return (
          <div
            key={gathering.id}
            className={`sf-card sf-card-hover p-4 ${
              gathering.is_secret ? "secret-card" : ""
            }`}
          >
            <div className="mb-2 flex items-start gap-3">
              <span className="text-3xl">{gathering.emoji}</span>
              <div className="flex-1">
                <h3 className="font-medium text-ink">{gathering.title}</h3>
                <p className="mt-0.5 text-xs text-ink-light">
                  Организатор:{" "}
                  <span className="font-medium text-peach-deep">
                    {gathering.host_name}
                  </span>
                </p>
              </div>
            </div>

            {gathering.description && (
              <p className="mb-3 text-xs leading-relaxed text-ink-light">
                {gathering.description}
              </p>
            )}

            {gathering.is_secret && gathering.hidden_location && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-peach-soft px-3 py-2 text-xs font-medium text-peach-deep">
                <MapPinned size={13} strokeWidth={1.75} />
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
              <span className="sf-badge px-2.5 py-1 normal-case tracking-normal">
                {gathering.date_time}
              </span>
              <span className="sf-badge px-2.5 py-1 normal-case tracking-normal">
                Мест: {gathering.spots_left}
              </span>
            </div>

            {isHost && (
              <div className="mb-3 rounded-xl border border-sand bg-stone-50/80 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  <UserCheck size={12} className="text-peach-muted" />
                  Кто присоединился ({guests.length})
                </p>
                {guests.length === 0 ? (
                  <p className="text-xs text-ink-light">
                    Пока никто не записался — ждём участников
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {guests.map((guest) => (
                      <li
                        key={guest.uid}
                        className="rounded-lg bg-white px-2.5 py-2 text-xs"
                      >
                        <p className="font-medium text-ink">{guest.name}</p>
                        {guest.email ? (
                          <a
                            href={`mailto:${guest.email}`}
                            className="mt-0.5 inline-flex items-center gap-1 text-ink-light hover:text-peach-deep"
                          >
                            <Mail size={11} className="shrink-0 text-peach-muted" />
                            {guest.email}
                          </a>
                        ) : (
                          <p className="mt-0.5 text-ink-faint">Email не указан</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              onClick={() =>
                handleJoinGathering(gathering.id, gathering.is_secret)
              }
              disabled={
                gathering.isJoined ||
                gathering.spots_left <= 0 ||
                actionLoading === gathering.id
              }
              className={`w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                gathering.isJoined
                  ? "cursor-default bg-peach-soft text-peach-deep"
                  : gathering.spots_left <= 0
                    ? "cursor-not-allowed bg-stone-100 text-ink-faint"
                    : gathering.is_secret
                      ? "sf-btn-primary"
                      : "sf-btn-soft"
              }`}
            >
              {actionLoading === gathering.id ? (
                <Loader2 size={16} className="mx-auto animate-spin" />
              ) : gathering.isJoined ? (
                "Вы идёте"
              ) : gathering.spots_left <= 0 ? (
                "Мест нет"
              ) : (
                (gathering.join_label ?? "Присоединиться")
              )}
            </button>
          </div>
          );
        })}
      </div>
    </section>
  );
}
