import type { Activity } from "./types";

export const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    title: "Пикник в Ала-Арче",
    description:
      "Собери корзинку с фруктами, возьми плед и наслаждайся горным воздухом у реки.",
    budget: "500–800 сом",
    mode: "solo",
  },
  {
    id: "a2",
    title: "Утренний пробег по парку",
    description:
      "5 км лёгкого бега в парке им. Панфилова — отличный старт дня и заряд энергии.",
    budget: "Бесплатно",
    mode: "solo",
  },
  {
    id: "a3",
    title: "Мастер-класс по акварели",
    description:
      "Запишись на открытый урок живописи в креативном центре «ArtLab».",
    budget: "1 200 сом",
    mode: "solo",
  },
  {
    id: "a4",
    title: "Караоке-вечер",
    description:
      "Сними комнату в караоке-баре и устрой музыкальный марафон с друзьями.",
    budget: "2 000–3 500 сом",
    mode: "friends",
  },
  {
    id: "a5",
    title: "Барбекю на даче",
    description:
      "Арендуй дачу за городом, купи мясо и устрой летний BBQ-пати.",
    budget: "3 000–5 000 сом",
    mode: "friends",
  },
  {
    id: "a6",
    title: "Настольные игры",
    description:
      "Соберите компанию в кафе с настолками — Monopoly, UNO, Codenames.",
    budget: "800–1 500 сом",
    mode: "friends",
  },
  {
    id: "a7",
    title: "Поход на водопад",
    description:
      "Групповой треккинг к водопаду Барскoon — приключение на целый день.",
    budget: "1 500 сом",
    mode: "friends",
  },
  {
    id: "a8",
    title: "Йога на крыше",
    description:
      "Присоединись к open-air йога-сессии на крыше с видом на горы.",
    budget: "400 сом",
    mode: "solo",
  },
];

export const SECRET_EVENT: Activity & {
  isSecret: true;
  hiddenLocation: string;
  revealedLocation: string;
  availableUntil: string;
} = {
  id: "secret_camp_007",
  title: "🔥 СЕКРЕТНЫЙ ЛЕТНИЙ ЛАГЕРЬ: Ночной костёр в ущелье!",
  description:
    "Поздравляем, ты выбил 5% шанс! Тайная локация откроется только после записи. Берём гитары, какао и спальники. Автобус забирает всех в 19:00.",
  budget: "Эксклюзив — бесплатно",
  mode: "friends",
  isSecret: true,
  hiddenLocation: "Ущелье ???",
  revealedLocation: "Ущелье Ала-Арча, точка сбора: парковка у моста",
  availableUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
};
