"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, MapPin, Ticket } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";
import {
  EVENT_TYPE_LABELS,
  fetchKgEvents,
  filterKgEvents,
  formatEventDate,
  type KgEvent,
} from "@/lib/kg-events";

export default function HomePage() {
  const router = useRouter();
  const {
    actionLoading,
    handleAddActivityToChallenges,
    openGatheringModal,
    actionError,
  } = useAppData();

  const [showFree, setShowFree] = useState(true);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<KgEvent[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchKgEvents().then((data) => {
      if (!cancelled) {
        setEvents(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = filterKgEvents(events, showFree);

  return (
    <section className="space-y-4">
      <div className="lg:hidden">
        <h2 className="text-base font-semibold text-ink">
          Ивенты в Кыргызстане
        </h2>
        <p className="text-xs text-ink-light">Бесплатные и платные</p>
      </div>
      <p className="hidden text-sm text-ink-light lg:block">
        Бесплатные и платные ивенты по всей стране
      </p>

      <button
        onClick={() => {
          setShowFree((v) => !v);
          setExpandedId(null);
        }}
        className="relative flex h-10 w-full max-w-xs items-center rounded-full bg-stone-100 p-1 lg:max-w-sm"
        aria-label="Бесплатные или платные"
      >
        <span
          className={`absolute h-8 w-[calc(50%-4px)] rounded-full bg-peach-muted transition-all duration-300 ease-out ${
            showFree ? "left-1" : "left-[calc(50%+2px)]"
          }`}
        />
        <span
          className={`relative z-10 flex-1 text-center text-xs font-medium transition-colors ${
            showFree ? "text-white" : "text-ink-light"
          }`}
        >
          Бесплатные
        </span>
        <span
          className={`relative z-10 flex-1 text-center text-xs font-medium transition-colors ${
            !showFree ? "text-white" : "text-ink-light"
          }`}
        >
          Платные
        </span>
      </button>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-light">
          <Loader2 size={18} className="animate-spin text-peach-muted" />
          Загружаем ивенты...
        </div>
      )}

      {!loading && visible.length === 0 && (
        <p className="sf-card px-4 py-8 text-center text-sm text-ink-light">
          Пока нет {showFree ? "бесплатных" : "платных"} ивентов
        </p>
      )}

      {!loading && (
        <ul className="space-y-2.5 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
          {visible.map((event) => {
            const open = expandedId === event.id;
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : event.id)}
                  className="sf-card sf-card-hover w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-ink">{event.title}</span>
                    <span className="sf-badge shrink-0 px-2 py-0.5">
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-light">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-peach-muted" />
                      {formatEventDate(event.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-peach-muted" />
                      {event.location}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-peach-deep">
                      <Ticket size={12} className="text-peach-muted" />
                      {event.isFree ? "Бесплатно" : event.price}
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="mt-1.5 flex gap-2 rounded-xl bg-stone-50 p-2">
                    <button
                      onClick={async () => {
                        try {
                          await handleAddActivityToChallenges({
                            title: event.title,
                            description: `${formatEventDate(event.date)} · ${event.location}`,
                          });
                          router.push("/challenges");
                        } catch {
                          // banner
                        }
                      }}
                      disabled={actionLoading === "add-challenge"}
                      className="sf-btn-primary flex-1 py-2 text-[11px] disabled:opacity-70"
                    >
                      {actionLoading === "add-challenge" ? (
                        <Loader2 size={12} className="mx-auto animate-spin" />
                      ) : (
                        "В челленджи"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        openGatheringModal(
                          event.title,
                          `${formatEventDate(event.date)} · ${event.location}`
                        );
                        router.push("/gatherings");
                      }}
                      className="sf-btn-soft flex-1 py-2 text-[11px]"
                    >
                      Собрать компанию
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {actionError && (
        <p className="sf-error px-3 py-2 text-xs">{actionError}</p>
      )}
    </section>
  );
}
