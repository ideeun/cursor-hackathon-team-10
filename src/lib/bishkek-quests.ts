import type { QuestCheckpoint } from "./types";

export const BISHKEK_DISTRICTS = [
  "Центр",
  "Асанbay",
  "Джал",
  "Ак-Орго",
  "Восток-5",
  "Кок-Жар",
] as const;

export type BishkekDistrict = (typeof BISHKEK_DISTRICTS)[number];

const FALLBACK_BY_DISTRICT: Record<string, QuestCheckpoint[]> = {
  Центр: [
    {
      order: 0,
      title: "Фонтан у ЦУМа",
      description: "Найди фонтан рядом с ЦУМом на площади Ала-Тоо",
      hint: "Центральная площадь, рядом с главным универмагом",
      lat: 42.8746,
      lng: 74.6034,
      radiusMeters: 120,
    },
    {
      order: 1,
      title: "Скульптура Манаса",
      description: "Сфотографируйся у памятника Манаса",
      hint: "Площадь перед филармонией",
      lat: 42.8772,
      lng: 74.6103,
      radiusMeters: 100,
    },
    {
      order: 2,
      title: "Ош базар — вход",
      description: "Дойди до главного входа на Ош базар",
      hint: "Улица Аaly Tokombaev, красные ворота",
      lat: 42.8741,
      lng: 74.6189,
      radiusMeters: 150,
    },
    {
      order: 3,
      title: "Парк Панфилова",
      description: "Найди аллею с фонтаном в парке Панфилова",
      hint: "Зелёный оазис в центре города",
      lat: 42.8815,
      lng: 74.6058,
      radiusMeters: 130,
    },
  ],
  Асанbay: [
    {
      order: 0,
      title: "Асанbay-мост",
      description: "Подойди к мосту через канал Ала-Арча",
      hint: "Главный мост района Асанbay",
      lat: 42.8189,
      lng: 74.6812,
      radiusMeters: 120,
    },
    {
      order: 1,
      title: "Парк Асанbay",
      description: "Найди детскую площадку в парке",
      hint: "Центральный парк микрорайона",
      lat: 42.8215,
      lng: 74.6889,
      radiusMeters: 100,
    },
    {
      order: 2,
      title: "Спорткомплекс",
      description: "Сделай фото у спортивного комплекса",
      hint: "Большое здание с трибунами",
      lat: 42.8156,
      lng: 74.6754,
      radiusMeters: 130,
    },
  ],
  Джал: [
    {
      order: 0,
      title: "Джал-15 — сквер",
      description: "Найди сквер с памятником в микрорайоне",
      hint: "Центральная аллея Джал-15",
      lat: 42.8534,
      lng: 74.5921,
      radiusMeters: 120,
    },
    {
      order: 1,
      title: "Фонтан на проспекте",
      description: "Сфотографируйся у декоративного фонтана",
      hint: "Проспект Чуй, район Джал",
      lat: 42.8567,
      lng: 74.5988,
      radiusMeters: 110,
    },
    {
      order: 2,
      title: "Спортплощадка",
      description: "Дойди до открытой спортплощадки",
      hint: "Бasketball court рядом со школой",
      lat: 42.8512,
      lng: 74.5867,
      radiusMeters: 100,
    },
  ],
};

export function getFallbackQuest(
  district: string,
  title?: string
): { title: string; checkpoints: QuestCheckpoint[] } {
  const checkpoints =
    FALLBACK_BY_DISTRICT[district] ?? FALLBACK_BY_DISTRICT["Центр"];
  return {
    title: title ?? `Квест по району ${district}`,
    checkpoints: checkpoints.map((cp, i) => ({ ...cp, order: i })),
  };
}
