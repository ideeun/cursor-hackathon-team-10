import eventsData from "@/data/kg-events.json";

export type KgEventType =
  | "music"
  | "sport"
  | "culture"
  | "food"
  | "outdoor"
  | "festival";

export interface KgEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: KgEventType;
  isFree: boolean;
  price?: string;
}

const EVENTS = eventsData as KgEvent[];

/** Имитация API: задержка + JSON как с бэкенда */
export function fetchKgEvents(delayMs = 400): Promise<KgEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...EVENTS]), delayMs);
  });
}

export type KgEventSortMode = "nearest" | "type";

export const KG_EVENT_TYPES: KgEventType[] = [
  "music",
  "sport",
  "culture",
  "food",
  "outdoor",
  "festival",
];

export function filterKgEvents(
  events: KgEvent[],
  options: { freeOnly: boolean; type?: KgEventType | "all" }
): KgEvent[] {
  return events.filter((e) => {
    if (e.isFree !== options.freeOnly) return false;
    if (options.type && options.type !== "all" && e.type !== options.type) {
      return false;
    }
    return true;
  });
}

export function searchKgEvents(events: KgEvent[], query: string): KgEvent[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return events;
  return events.filter((e) =>
    e.title.toLowerCase().includes(normalized)
  );
}

export function sortKgEvents(
  events: KgEvent[],
  mode: KgEventSortMode
): KgEvent[] {
  const sorted = [...events];
  if (mode === "nearest") {
    return sorted.sort((a, b) => a.date.localeCompare(b.date));
  }
  return sorted.sort((a, b) => {
    const byType = EVENT_TYPE_LABELS[a.type].localeCompare(
      EVENT_TYPE_LABELS[b.type],
      "ru"
    );
    if (byType !== 0) return byType;
    return a.date.localeCompare(b.date);
  });
}

export function getSortLabel(
  mode: KgEventSortMode,
  type: KgEventType | "all"
): string {
  if (mode === "nearest") return "Ближайшие";
  if (type === "all") return "По типу · все";
  return `По типу · ${EVENT_TYPE_LABELS[type]}`;
}

export const EVENT_TYPE_LABELS: Record<KgEventType, string> = {
  music: "Музыка",
  sport: "Спорт",
  culture: "Культура",
  food: "Еда",
  outdoor: "Природа",
  festival: "Фестиваль",
};

export function formatEventDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}
