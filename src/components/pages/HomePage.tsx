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
    <section className="space-y-3">
      <div className="lg:hidden">
        <h2 className="text-base font-bold text-stone-800">
          Ивенты в Кыргызстане
        </h2>
        <p className="text-xs text-stone-500">Бесплатные и платные</p>
      </div>
      <p className="hidden text-sm text-stone-500 lg:block">
        Бесплатные и платные ивенты по всей стране
      </p>

      <button
        onClick={() => {
          setShowFree((v) => !v);
          setExpandedId(null);
        }}
        className="relative flex h-10 w-full max-w-xs items-center rounded-full bg-gradient-to-r from-emerald-100 to-orange-100 p-1 shadow-inner lg:max-w-sm"
        aria-label="Бесплатные или платные"
      >
        <span
          className={`absolute h-8 w-[calc(50%-4px)] rounded-full shadow-lg transition-all duration-300 ease-out ${
            showFree
              ? "left-1 bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "left-[calc(50%+2px)] bg-gradient-to-r from-orange-500 to-amber-400"
          }`}
        />
        <span
          className={`relative z-10 flex-1 text-center text-xs font-bold transition-colors ${
            showFree ? "text-white" : "text-stone-500"
          }`}
        >
          Бесплатные
        </span>
        <span
          className={`relative z-10 flex-1 text-center text-xs font-bold transition-colors ${
            !showFree ? "text-white" : "text-stone-500"
          }`}
        >
          Платные
        </span>
      </button>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-stone-500">
          <Loader2 size={18} className="animate-spin text-orange-500" />
          Загружаем ивенты...
        </div>
      )}

      {!loading && visible.length === 0 && (
        <p className="rounded-2xl bg-white/80 px-4 py-6 text-center text-sm text-stone-500">
          Пока нет {showFree ? "бесплатных" : "платных"} ивентов
        </p>
      )}

      {!loading && (
        <ul className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
          {visible.map((event) => {
            const open = expandedId === event.id;
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(open ? null : event.id)
                  }
                  className="w-full rounded-2xl border border-orange-100 bg-white p-3.5 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-stone-800">
                      {event.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-sky-500" />
                      {formatEventDate(event.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-500" />
                      {event.location}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        event.isFree ? "text-emerald-600" : "text-orange-600"
                      }`}
                    >
                      <Ticket size={12} />
                      {event.isFree ? "Бесплатно" : event.price}
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="mt-1 flex gap-2 rounded-2xl border border-orange-50 bg-orange-50/50 p-2">
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
                      className="flex-1 rounded-xl bg-emerald-500 py-2 text-[11px] font-bold text-white disabled:opacity-70"
                    >
                      {actionLoading === "add-challenge" ? (
                        <Loader2
                          size={12}
                          className="mx-auto animate-spin"
                        />
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
                      className="flex-1 rounded-xl bg-sky-500 py-2 text-[11px] font-bold text-white"
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
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          {actionError}
        </p>
      )}
    </section>
  );
}
