"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Trophy,
  Users,
  User,
  MapPin,
  Sun,
  Loader2,
  Plus,
  X,
  Flame,
  Sparkles,
} from "lucide-react";
import { initAnalytics } from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActivityMode = "solo" | "friends";

interface Activity {
  id: string;
  title: string;
  description: string;
  budget: string;
  mode: ActivityMode;
}

type ChallengeStatus = "available" | "in_progress" | "completed";

interface LeaderboardEntry {
  name: string;
  value: string;
  rank: number;
}

interface Challenge {
  id: string;
  title: string;
  emoji: string;
  type: "progress" | "leaderboard" | "status";
  current?: number;
  target?: number;
  unit?: string;
  leaderboard?: LeaderboardEntry[];
  status: ChallengeStatus;
  participantStatus: "none" | "in_progress" | "completed";
}

interface Gathering {
  id: string;
  title: string;
  host: string;
  date?: string;
  time?: string;
  spotsLeft: number;
  joined: boolean;
  category: string;
  description?: string;
  emoji: string;
  joinLabel: string;
}

type NavTab = "home" | "challenges" | "gatherings" | "profile";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const initialActivities: Activity[] = [
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

const initialChallenges: Challenge[] = [
  {
    id: "c1",
    title: "Летний марафон шагов",
    emoji: "👟",
    type: "progress",
    current: 8500,
    target: 10000,
    unit: "шагов",
    status: "in_progress",
    participantStatus: "in_progress",
  },
  {
    id: "c2",
    title: "Велозаезд 15 км",
    emoji: "🚴",
    type: "leaderboard",
    leaderboard: [
      { name: "Нурбек", value: "14.2 км", rank: 1 },
      { name: "Асем", value: "12.8 км", rank: 2 },
      { name: "Ты", value: "9.5 км", rank: 3 },
    ],
    status: "in_progress",
    participantStatus: "in_progress",
  },
  {
    id: "c3",
    title: "Утренняя йога",
    emoji: "🧘",
    type: "status",
    status: "completed",
    participantStatus: "completed",
  },
  {
    id: "c4",
    title: "10 000 шагов в день",
    emoji: "🔥",
    type: "progress",
    current: 3200,
    target: 10000,
    unit: "шагов",
    status: "available",
    participantStatus: "none",
  },
];

const initialGatherings: Gathering[] = [
  {
    id: "g1",
    title: "Палаточный лагерь на Иссык-Куле!",
    host: "Асем",
    date: "15–17 июня",
    spotsLeft: 4,
    joined: false,
    category: "camp",
    description: "Два дня у озера: костёр, плавание и звёздное небо.",
    emoji: "🏕️",
    joinLabel: "ПОГНАЛИ! 🏕️",
  },
  {
    id: "g2",
    title: "Волейбол на пляже",
    host: "Максат",
    time: "Сегодня 18:00",
    spotsLeft: 6,
    joined: false,
    category: "sport",
    description: "Летний волейбол на пляже — бери кроссовки и хорошее настроение.",
    emoji: "🏐",
    joinLabel: "Я В ДЕЛЕ! 🏐",
  },
  {
    id: "g3",
    title: "Велопрогулка по Магистрали",
    host: "Нурбек",
    date: "Завтра 09:00",
    spotsLeft: 8,
    joined: false,
    category: "sport",
    description: "20 км по велодорожке — средний темп, остановки для фото.",
    emoji: "🚴",
    joinLabel: "Присоединиться",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToggleSwitch({
  isSolo,
  onToggle,
}: {
  isSolo: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative flex h-10 w-52 items-center rounded-full bg-gradient-to-r from-orange-100 to-sky-100 p-1 shadow-inner transition-all duration-300"
      aria-label="Переключить режим"
    >
      <span
        className={`absolute h-8 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-lg transition-all duration-300 ease-out ${
          isSolo ? "left-1" : "left-[calc(50%+2px)]"
        }`}
      />
      <span
        className={`relative z-10 flex-1 text-center text-xs font-bold transition-colors duration-300 ${
          isSolo ? "text-white" : "text-stone-500"
        }`}
      >
        Соло
      </span>
      <span
        className={`relative z-10 flex-1 text-center text-xs font-bold transition-colors duration-300 ${
          !isSolo ? "text-white" : "text-stone-500"
        }`}
      >
        С друзьями
      </span>
    </button>
  );
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-stone-500">
        <span>
          {current.toLocaleString("ru-RU")} / {target.toLocaleString("ru-RU")}
        </span>
        <span className="font-semibold text-emerald-600">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BottomNav({
  active,
  onChange,
}: {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Главная", icon: <Home size={20} /> },
    { id: "challenges", label: "Челленджи", icon: <Trophy size={20} /> },
    { id: "gatherings", label: "Сборы", icon: <Users size={20} /> },
    { id: "profile", label: "Профиль", icon: <User size={20} /> },
  ];

  return (
    <nav className="sticky bottom-0 z-40 border-t border-orange-100/80 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 transition-all duration-300 ${
              active === tab.id
                ? "text-orange-500"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <span
              className={`transition-transform duration-300 ${
                active === tab.id ? "scale-110" : ""
              }`}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] font-semibold">{tab.label}</span>
            {active === tab.id && (
              <span className="h-0.5 w-4 rounded-full bg-orange-500" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function SummerFlowDashboard() {
  const [isSoloMode, setIsSoloMode] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Activity | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [gatherings, setGatherings] = useState<Gathering[]>(initialGatherings);
  const [activeNav, setActiveNav] = useState<NavTab>("home");
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("other");

  useEffect(() => {
    initAnalytics();
  }, []);

  const handleBoredClick = () => {
    setAiLoading(true);
    setAiResult(null);
    setTimeout(() => {
      const mode: ActivityMode = isSoloMode ? "solo" : "friends";
      const filtered = initialActivities.filter((a) => a.mode === mode);
      const random =
        filtered[Math.floor(Math.random() * filtered.length)] ?? filtered[0];
      setAiResult(random);
      setAiLoading(false);
    }, 1000);
  };

  const handleJoinChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id && c.participantStatus === "none"
          ? { ...c, participantStatus: "in_progress", status: "in_progress" }
          : c
      )
    );
  };

  const handleJoinGathering = (id: string) => {
    setGatherings((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        if (g.joined) return g;
        return {
          ...g,
          joined: true,
          spotsLeft: Math.max(0, g.spotsLeft - 1),
        };
      })
    );
  };

  const handleCreateGathering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    const newGathering: Gathering = {
      id: `g${Date.now()}`,
      title: formTitle,
      host: "Максат",
      date: "Скоро",
      spotsLeft: 10,
      joined: false,
      category: formCategory,
      description: formDescription,
      emoji: "✨",
      joinLabel: "Присоединиться",
    };
    setGatherings((prev) => [newGathering, ...prev]);
    setFormTitle("");
    setFormDescription("");
    setFormCategory("other");
    setShowModal(false);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavChange = (tab: NavTab) => {
    setActiveNav(tab);
    if (tab === "home") window.scrollTo({ top: 0, behavior: "smooth" });
    if (tab === "challenges") scrollToSection("challenges-section");
    if (tab === "gatherings") scrollToSection("gatherings-section");
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-gradient-to-b from-orange-50 via-amber-50/30 to-sky-50 shadow-2xl">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 space-y-3 bg-gradient-to-b from-orange-50/95 to-amber-50/80 px-4 pb-3 pt-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-lg font-bold text-white shadow-lg">
              М
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">
                Салам, Максат! 👋
              </p>
              <p className="text-xs text-stone-500">
                Level 3 Explorer ·{" "}
                <span className="font-semibold text-orange-500">450 XP</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-2xl bg-white/80 px-3 py-2 shadow-md">
            <Flame size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-600">3</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <MapPin size={15} className="text-sky-500" />
            <span className="font-medium">Бишкек</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
            <Sun size={15} className="text-amber-500" />
            +32°C, Солнечно ☀️
          </div>
        </div>

        <div className="flex justify-center">
          <ToggleSwitch
            isSolo={isSoloMode}
            onToggle={() => {
              setIsSoloMode((v) => !v);
              setAiResult(null);
            }}
          />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 space-y-6 overflow-y-auto px-4 pb-28 pt-2">
        {/* Module 1: I'm Bored AI */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-orange-500" />
            <h2 className="text-base font-bold text-stone-800">
              AI-генератор активностей
            </h2>
          </div>

          <button
            onClick={handleBoredClick}
            disabled={aiLoading}
            className="animate-pulse-glow w-full rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-5 text-xl font-black tracking-wide text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-80"
          >
            {aiLoading ? (
              <span className="flex items-center justify-center gap-3 text-base">
                <Loader2 size={22} className="animate-spin-slow" />
                AI подбирает активность...
              </span>
            ) : (
              "МНЕ СКУЧНО! 🌴"
            )}
          </button>

          {aiResult && !aiLoading && (
            <div className="space-y-3 rounded-3xl border border-orange-100 bg-white p-5 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-stone-800">
                  {aiResult.title}
                </h3>
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-600">
                  {aiResult.mode === "solo" ? "Соло" : "С друзьями"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-stone-600">
                {aiResult.description}
              </p>
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2">
                <span className="text-xs text-stone-500">Бюджет:</span>
                <span className="text-sm font-bold text-emerald-700">
                  {aiResult.budget}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setActiveNav("challenges");
                    scrollToSection("challenges-section");
                  }}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
                >
                  В челленджи 🏃‍♂️
                </button>
                <button
                  onClick={() => {
                    setActiveNav("gatherings");
                    scrollToSection("gatherings-section");
                  }}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
                >
                  Собрать компанию 👥
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Module 2: Challenges */}
        <section id="challenges-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-emerald-500" />
              <h2 className="text-base font-bold text-stone-800">
                Летние челленджи
              </h2>
            </div>
            <span className="text-xs text-stone-400">Свайп →</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x [-ms-overflow-style:none] [scrollbar-width:none]">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="w-72 shrink-0 snap-start rounded-3xl border border-emerald-100 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{challenge.emoji}</span>
                  <h3 className="text-sm font-bold text-stone-800">
                    {challenge.title}
                  </h3>
                </div>

                {challenge.type === "progress" && (
                  <ProgressBar
                    current={challenge.current ?? 0}
                    target={challenge.target ?? 100}
                  />
                )}

                {challenge.type === "leaderboard" && challenge.leaderboard && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      Лидерборд
                    </p>
                    {challenge.leaderboard.map((entry) => (
                      <div
                        key={entry.name}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs ${
                          entry.name === "Ты"
                            ? "bg-sky-50 font-bold text-sky-700"
                            : "bg-stone-50 text-stone-600"
                        }`}
                      >
                        <span>
                          #{entry.rank} {entry.name}
                        </span>
                        <span>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {challenge.type === "status" &&
                  challenge.participantStatus === "completed" && (
                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5">
                      <span className="text-lg">✅</span>
                      <span className="text-sm font-bold text-emerald-700">
                        Выполнено!
                      </span>
                    </div>
                  )}

                {challenge.participantStatus === "none" && (
                  <button
                    onClick={() => handleJoinChallenge(challenge.id)}
                    className="mt-3 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 py-2 text-xs font-bold text-white shadow transition-all duration-300 hover:shadow-md active:scale-95"
                  >
                    Участвовать
                  </button>
                )}

                {challenge.participantStatus === "in_progress" &&
                  challenge.type !== "status" && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-amber-50 py-2 text-xs font-bold text-amber-700">
                      <Loader2 size={12} className="animate-spin" />
                      В процессе
                    </div>
                  )}
              </div>
            ))}
          </div>
        </section>

        {/* Module 3: Gatherings Feed */}
        <section id="gatherings-section" className="space-y-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-sky-500" />
            <h2 className="text-base font-bold text-stone-800">
              Сборы и встречи
            </h2>
          </div>

          <div className="space-y-3">
            {gatherings.map((gathering) => (
              <div
                key={gathering.id}
                className="rounded-3xl border border-sky-100 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-2 flex items-start gap-3">
                  <span className="text-3xl">{gathering.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800">
                      {gathering.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Организатор:{" "}
                      <span className="font-semibold text-sky-600">
                        {gathering.host}
                      </span>
                    </p>
                  </div>
                </div>

                {gathering.description && (
                  <p className="mb-3 text-xs leading-relaxed text-stone-500">
                    {gathering.description}
                  </p>
                )}

                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  {gathering.date && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                      📅 {gathering.date}
                    </span>
                  )}
                  {gathering.time && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 font-medium text-orange-700">
                      🕐 {gathering.time}
                    </span>
                  )}
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
                    👥 Мест: {gathering.spotsLeft}
                  </span>
                </div>

                <button
                  onClick={() => handleJoinGathering(gathering.id)}
                  disabled={gathering.joined}
                  className={`w-full rounded-2xl py-2.5 text-sm font-bold transition-all duration-300 active:scale-95 ${
                    gathering.joined
                      ? "cursor-default bg-emerald-100 text-emerald-700"
                      : "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {gathering.joined
                    ? "Вы идёте! ✅"
                    : gathering.joinLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Profile placeholder when nav is profile */}
        {activeNav === "profile" && (
          <section className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-md">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-2xl font-bold text-white">
              М
            </div>
            <h3 className="text-lg font-bold text-stone-800">Максат</h3>
            <p className="text-sm text-stone-500">Level 3 Explorer</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "XP", value: "450" },
                { label: "Челленджи", value: "3" },
                { label: "Сборы", value: "2" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-orange-50 py-3"
                >
                  <p className="text-lg font-black text-orange-600">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-stone-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-[calc(50%-11rem)] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-orange-300/50 active:scale-95 md:right-auto md:translate-x-[calc(min(50vw,224px)-3.5rem)]"
        aria-label="Объявить сбор"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-300 rounded-t-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-800">
                Объявить сбор ✨
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full bg-stone-100 p-2 text-stone-500 transition-colors hover:bg-stone-200"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateGathering} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">
                  Название
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Например: Поход на водопад"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">
                  Описание
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Расскажи подробнее..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">
                  Категория
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="sport">Спорт</option>
                  <option value="camp">Лагерь / Поход</option>
                  <option value="party">Вечеринка</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
              >
                Опубликовать 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Bottom Nav ── */}
      <BottomNav active={activeNav} onChange={handleNavChange} />
    </div>
  );
}
