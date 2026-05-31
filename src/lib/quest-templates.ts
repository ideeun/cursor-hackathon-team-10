import type { QuestCheckpoint } from "./types";

export const SPORT_OPTIONS = [
  { id: "football", label: "Футбол", emoji: "⚽" },
  { id: "running", label: "Бег", emoji: "🏃" },
  { id: "volleyball", label: "Волейбол", emoji: "🏐" },
  { id: "basketball", label: "Баскетбол", emoji: "🏀" },
  { id: "cycling", label: "Велосипед", emoji: "🚴" },
] as const;

export const SKILL_OPTIONS = [
  { id: "guitar", label: "Игра на гитаре", emoji: "🎸" },
  { id: "english", label: "Английский язык", emoji: "🇬🇧" },
  { id: "coding", label: "Программирование", emoji: "💻" },
  { id: "yoga", label: "Йога", emoji: "🧘" },
  { id: "calisthenics", label: "Калистеника", emoji: "💪" },
] as const;

const SPORT_FALLBACK: Record<string, QuestCheckpoint[]> = {
  football: [
    {
      order: 0,
      title: "Старт на стадионе «Спартак»",
      description: "Разминка и 20 ударов по воротам с друзьями",
      hint: "Стадион Спартак, центр поля",
      lat: 42.8828,
      lng: 74.6195,
      radiusMeters: 150,
    },
    {
      order: 1,
      title: "Парк Панфилова — пас",
      description: "30 точных передач напарнику на газоне",
      hint: "Футбольное поле в парке",
      lat: 42.8815,
      lng: 74.6058,
      radiusMeters: 130,
    },
    {
      order: 2,
      title: "Asanbay Arena",
      description: "Мини-матч 2 на 2 до 3 голов",
      hint: "Спортплощадка Асанbay",
      lat: 42.8215,
      lng: 74.6889,
      radiusMeters: 120,
    },
    {
      order: 3,
      title: "Финиш — фото команды",
      description: "Общее фото команды с мячом",
      hint: "Любая площадка, главное — вместе!",
      lat: 42.8746,
      lng: 74.6034,
      radiusMeters: 200,
    },
  ],
  running: [
    {
      order: 0,
      title: "Разминка у Ala-Archa",
      description: "2 км лёгкого бега вдоль канала",
      hint: "Набережная канала в центре",
      lat: 42.8765,
      lng: 74.6088,
      radiusMeters: 150,
    },
    {
      order: 1,
      title: "Спринт в парке",
      description: "5 спринтов по 100 м с другом",
      hint: "Парк Панфилова, беговая дорожка",
      lat: 42.8815,
      lng: 74.6058,
      radiusMeters: 130,
    },
    {
      order: 2,
      title: "Горка на Дубовом парке",
      description: "3 подъёма в горку с таймером",
      hint: "Дубовый парк, главный вход",
      lat: 42.8698,
      lng: 74.5965,
      radiusMeters: 120,
    },
    {
      order: 3,
      title: "Финиш 5 км",
      description: "Совместный забег 5 км — фото на финише",
      hint: "Площадь Ала-Тоо",
      lat: 42.8746,
      lng: 74.6034,
      radiusMeters: 150,
    },
  ],
  volleyball: [
    {
      order: 0,
      title: "Пляжный волейбол",
      description: "Розыгрыш до 11 очков с друзьями",
      hint: "Спорткомплекс или открытая площадка",
      lat: 42.8534,
      lng: 74.5921,
      radiusMeters: 130,
    },
    {
      order: 1,
      title: "Подача — 20 раз",
      description: "20 успешных подач подряд",
      hint: "Волейбольная площадка района",
      lat: 42.8215,
      lng: 74.6889,
      radiusMeters: 120,
    },
    {
      order: 2,
      title: "Командный блок",
      description: "Командное фото после матча",
      hint: "Любая площадка с сеткой",
      lat: 42.8815,
      lng: 74.6058,
      radiusMeters: 130,
    },
    {
      order: 3,
      title: "Турнир 3 на 3",
      description: "Мини-турнир с друзьями — кто выиграет?",
      hint: "Центральная спортплощадка",
      lat: 42.8746,
      lng: 74.6034,
      radiusMeters: 150,
    },
  ],
};

function defaultSportCheckpoints(sport: string): QuestCheckpoint[] {
  return (
    SPORT_FALLBACK[sport] ??
    SPORT_FALLBACK.football.map((cp, i) => ({ ...cp, order: i }))
  );
}

export function getSportFallbackQuest(sport: string) {
  const opt = SPORT_OPTIONS.find((s) => s.id === sport) ?? SPORT_OPTIONS[0];
  const checkpoints = defaultSportCheckpoints(sport).map((cp, i) => ({
    ...cp,
    order: i,
  }));
  return {
    title: `${opt.emoji} Спорт-квест: ${opt.label} с друзьями`,
    checkpoints,
    emoji: opt.emoji,
    sport: opt.label,
  };
}

export function getMonthlyFallbackQuest(skill: string) {
  const opt = SKILL_OPTIONS.find((s) => s.id === skill) ?? SKILL_OPTIONS[0];
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 30);

  const checkpoints: QuestCheckpoint[] = [
    {
      order: 0,
      weekLabel: "Неделя 1",
      title: "Старт: первые шаги",
      description: `Начните учить ${opt.label.toLowerCase()} — 15 мин в день, фото процесса`,
      hint: "Сфоткайте себя за занятием",
      lat: 42.8746,
      lng: 74.6034,
      radiusMeters: 500,
      requiresLocation: false,
    },
    {
      order: 1,
      weekLabel: "Неделя 2",
      title: "Прогресс: закрепление",
      description: "Покажите, чему научились за 2 недели",
      hint: "Фото или видео результата",
      lat: 42.8746,
      lng: 74.6034,
      radiusMeters: 500,
      requiresLocation: false,
    },
    {
      order: 2,
      weekLabel: "Неделя 3",
      title: "Челлендж с другом",
      description: "Занимайтесь вместе с другом и сфоткайтесь",
      hint: "Совместное занятие = больше XP",
      lat: 42.8746,
      lng: 74.6034,
      radiusMeters: 500,
      requiresLocation: false,
    },
    {
      order: 3,
      weekLabel: "Неделя 4",
      title: "Финал: месяц пройден!",
      description: `Покажите итог — чему научились за месяц (${opt.label})`,
      hint: "Главное достижение месяца",
      lat: 42.8746,
      lng: 74.6034,
      radiusMeters: 500,
      requiresLocation: false,
    },
  ];

  return {
    title: `${opt.emoji} Месячный квест: освоить ${opt.label}`,
    checkpoints,
    emoji: opt.emoji,
    skill: opt.label,
    endsAt: endsAt.toISOString(),
  };
}

export function getQuestTypeLabel(type: string) {
  if (type === "sport") return "Спорт";
  if (type === "monthly") return "На месяц";
  return "Городской";
}

export function getQuestTypeEmoji(type: string) {
  if (type === "sport") return "🏃";
  if (type === "monthly") return "📚";
  return "🗺️";
}

export function formatDaysLeft(endsAt?: string) {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return days;
}
