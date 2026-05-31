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

export function filterKgEvents(events: KgEvent[], freeOnly: boolean): KgEvent[] {
  return events.filter((e) => e.isFree === freeOnly);
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
