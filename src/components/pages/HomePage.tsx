"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  Search,
  Ticket,
} from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";
import {
  EVENT_TYPE_LABELS,
  fetchKgEvents,
  filterKgEvents,
  formatEventDate,
  formatEventDetails,
  getSortLabel,
  KG_EVENT_TYPES,
  searchKgEvents,
  sortKgEvents,
  type KgEvent,
  type KgEventSortMode,
  type KgEventType,
} from "@/lib/kg-events";

export default function HomePage() {
  const router = useRouter();
  const { actionLoading, handleAddActivityToChallenges, actionError } =
    useAppData();

  const [showFree, setShowFree] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<KgEventSortMode>("nearest");
  const [eventType, setEventType] = useState<KgEventType | "all">("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [typeExpanded, setTypeExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<KgEvent[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!sortOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
        setTypeExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortOpen]);

  const visible = useMemo(() => {
    const filtered = filterKgEvents(events, {
      freeOnly: showFree,
      type: sortMode === "type" ? eventType : "all",
    });
    const searched = searchKgEvents(filtered, searchQuery);
    return sortKgEvents(searched, sortMode);
  }, [events, showFree, searchQuery, sortMode, eventType]);

  const sortLabel = getSortLabel(sortMode, eventType);

  const emptyMessage = (() => {
    const priceLabel = showFree ? "бесплатных" : "платных";
    if (searchQuery.trim()) {
      return `Ничего не найдено по запросу «${searchQuery.trim()}»`;
    }
    if (sortMode === "type" && eventType !== "all") {
      return `Нет ${priceLabel} ивентов типа «${EVENT_TYPE_LABELS[eventType]}»`;
    }
    return `Пока нет ${priceLabel} ивентов`;
  })();

  const selectNearest = () => {
    setSortMode("nearest");
    setEventType("all");
    setSortOpen(false);
    setTypeExpanded(false);
    setExpandedId(null);
  };

  const selectType = (type: KgEventType | "all") => {
    setSortMode("type");
    setEventType(type);
    setSortOpen(false);
    setTypeExpanded(false);
    setExpandedId(null);
  };

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

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setExpandedId(null);
          }}
          placeholder="Поиск по названию ивента"
          className="sf-input w-full py-2.5 pl-10 pr-4 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => {
            setShowFree((v) => !v);
            setExpandedId(null);
          }}
          className="relative flex h-10 w-full max-w-xs items-center rounded-full bg-stone-100 p-1 sm:max-w-[220px]"
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

        <div ref={sortRef} className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setSortOpen((open) => {
                const next = !open;
                if (next && sortMode === "type") setTypeExpanded(true);
                if (!next) setTypeExpanded(false);
                return next;
              });
            }}
            className="sf-btn-ghost flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm sm:min-w-[220px]"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
          >
            <span className="inline-flex items-center gap-2">
              <ArrowDownUp size={16} className="text-peach-muted" />
              <span className="text-ink-light">Сортировать:</span>
              <span className="font-medium text-ink">{sortLabel}</span>
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-ink-faint transition-transform ${
                sortOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {sortOpen && (
            <div className="absolute right-0 z-20 mt-1.5 w-full min-w-[240px] overflow-hidden rounded-xl border border-sand bg-surface shadow-[0_8px_24px_rgb(92_86_80/10%)] sm:w-64">
              <button
                type="button"
                onClick={selectNearest}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-peach-soft ${
                  sortMode === "nearest"
                    ? "font-medium text-peach-deep"
                    : "text-ink"
                }`}
              >
                Ближайшие
                {sortMode === "nearest" && (
                  <span className="text-xs text-peach-muted">✓</span>
                )}
              </button>

              <div className="border-t border-sand">
                <button
                  type="button"
                  onClick={() => setTypeExpanded((v) => !v)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-peach-soft ${
                    sortMode === "type"
                      ? "font-medium text-peach-deep"
                      : "text-ink"
                  }`}
                >
                  По типу
                  <ChevronDown
                    size={14}
                    className={`text-ink-faint transition-transform ${
                      typeExpanded ? "rotate-180" : "-rotate-90"
                    }`}
                  />
                </button>

                {typeExpanded && (
                  <div className="border-t border-sand bg-stone-50/80 py-1">
                    <button
                      type="button"
                      onClick={() => selectType("all")}
                      className={`flex w-full items-center justify-between px-4 py-2 pl-6 text-left text-sm transition-colors hover:bg-peach-soft ${
                        sortMode === "type" && eventType === "all"
                          ? "font-medium text-peach-deep"
                          : "text-ink-light"
                      }`}
                    >
                      Все типы
                      {sortMode === "type" && eventType === "all" && (
                        <span className="text-xs text-peach-muted">✓</span>
                      )}
                    </button>
                    {KG_EVENT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => selectType(type)}
                        className={`flex w-full items-center justify-between px-4 py-2 pl-6 text-left text-sm transition-colors hover:bg-peach-soft ${
                          sortMode === "type" && eventType === type
                            ? "font-medium text-peach-deep"
                            : "text-ink-light"
                        }`}
                      >
                        {EVENT_TYPE_LABELS[type]}
                        {sortMode === "type" && eventType === type && (
                          <span className="text-xs text-peach-muted">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-light">
          <Loader2 size={18} className="animate-spin text-peach-muted" />
          Загружаем ивенты...
        </div>
      )}

      {!loading && visible.length === 0 && (
        <p className="sf-card px-4 py-8 text-center text-sm text-ink-light">
          {emptyMessage}
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
                  <div className="mt-1.5 space-y-2 rounded-xl bg-stone-50 p-3">
                    <div className="space-y-1.5 text-xs text-ink-light">
                      <p className="inline-flex items-start gap-1.5">
                        <Clock
                          size={12}
                          className="mt-0.5 shrink-0 text-peach-muted"
                        />
                        <span>
                          {formatEventDate(event.date)}, начало{" "}
                          <span className="font-medium text-ink">
                            {event.startTime}
                          </span>
                        </span>
                      </p>
                      <p className="inline-flex items-start gap-1.5">
                        <MapPin
                          size={12}
                          className="mt-0.5 shrink-0 text-peach-muted"
                        />
                        <span>
                          <span className="text-ink-faint">{event.location} · </span>
                          {event.address}
                        </span>
                      </p>
                      {event.contact && (
                        <p className="inline-flex items-center gap-1.5">
                          <Phone size={12} className="shrink-0 text-peach-muted" />
                          {event.contact.startsWith("+") ? (
                            <a
                              href={`tel:${event.contact.replace(/\s/g, "")}`}
                              className="font-medium text-peach-deep hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {event.contact}
                            </a>
                          ) : (
                            <span className="font-medium text-peach-deep">
                              {event.contact}
                            </span>
                          )}
                        </p>
                      )}
                      {event.url && (
                        <p className="inline-flex items-center gap-1.5">
                          <ExternalLink
                            size={12}
                            className="shrink-0 text-peach-muted"
                          />
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate font-medium text-peach-deep hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Подробнее и билеты
                          </a>
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await handleAddActivityToChallenges({
                            title: event.title,
                            description: formatEventDetails(event),
                          });
                          router.push("/challenges");
                        } catch {
                          // banner
                        }
                      }}
                      disabled={actionLoading === "add-challenge"}
                      className="sf-btn-primary w-full py-2 text-[11px] disabled:opacity-70"
                    >
                      {actionLoading === "add-challenge" ? (
                        <Loader2 size={12} className="mx-auto animate-spin" />
                      ) : (
                        "В челленджи"
                      )}
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
