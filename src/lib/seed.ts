import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ChallengeDoc, GatheringDoc } from "./types";

const CHALLENGES: Record<string, ChallengeDoc> = {
  challenge_steps_2026: {
    title: "Летний марафон шагов",
    emoji: "👟",
    type: "progress",
    current_progress: 8500,
    target: 10000,
    unit: "шагов",
    participants: [],
    status: "in_progress",
  },
  challenge_bike_15: {
    title: "Велозаезд 15 км",
    emoji: "🚴",
    type: "leaderboard",
    participants: [],
    status: "in_progress",
    leaderboard: [
      { name: "Нурбек", value: "14.2 км", rank: 1 },
      { name: "Асем", value: "12.8 км", rank: 2 },
    ],
  },
  challenge_yoga_morning: {
    title: "Утренняя йога",
    emoji: "🧘",
    type: "status",
    participants: [],
    status: "completed",
  },
  challenge_10k_steps: {
    title: "10 000 шагов в день",
    emoji: "🔥",
    type: "progress",
    current_progress: 3200,
    target: 10000,
    unit: "шагов",
    participants: [],
    status: "available",
  },
};

const GATHERINGS: Record<string, GatheringDoc> = {
  gather_camp_01: {
    title: "Палаточный лагерь на Иссык-Куле!",
    host_name: "Асем",
    host_id: "seed_host_asem",
    description:
      "Едем на южный берег, берём палатки, гитары и отличное настроение.",
    date_time: "15–17 июня",
    max_spots: 10,
    spots_left: 4,
    attendees: [],
    category: "Кемпинг",
    emoji: "🏕️",
    join_label: "ПОГНАЛИ! 🏕️",
  },
  gather_volleyball: {
    title: "Волейбол на пляже",
    host_name: "Максат",
    host_id: "seed_host_maxat",
    description:
      "Летний волейбол на пляже — бери кроссовки и хорошее настроение.",
    date_time: "Сегодня 18:00",
    max_spots: 12,
    spots_left: 6,
    attendees: [],
    category: "Спорт",
    emoji: "🏐",
    join_label: "Я В ДЕЛЕ! 🏐",
  },
  gather_bike: {
    title: "Велопрогулка по Магистрали",
    host_name: "Нурбек",
    host_id: "seed_host_nurbek",
    description: "20 км по велодорожке — средний темп, остановки для фото.",
    date_time: "Завтра 09:00",
    max_spots: 10,
    spots_left: 8,
    attendees: [],
    category: "Спорт",
    emoji: "🚴",
    join_label: "Присоединиться",
  },
  secret_camp_007: {
    title: "🔥 СЕКРЕТНЫЙ ЛЕТНИЙ ЛАГЕРЬ: Ночной костёр в ущелье!",
    host_name: "SummerFlow Team",
    host_id: "seed_host_team",
    description:
      "Поздравляем, ты выбил 5% шанс! Тайная локация откроется только за 2 часа до старта. Берём гитары, какао и спальники. Автобус забирает всех в 19:00.",
    date_time: "Сегодня 19:00",
    max_spots: 15,
    spots_left: 6,
    attendees: [],
    category: "Кемпинг",
    emoji: "🔥",
    join_label: "Я В ДЕЛЕ! 🎒",
    is_secret: true,
    secret_chance: 0.05,
    available_until: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    hidden_location: "Ущелье ???",
  },
};

let seedPromise: Promise<void> | null = null;

export function seedFirestoreIfEmpty(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const [challengesSnap, gatheringsSnap] = await Promise.all([
      getDocs(collection(db, "challenges")),
      getDocs(collection(db, "gatherings")),
    ]);

    const batch = writeBatch(db);

    if (challengesSnap.empty) {
      for (const [id, data] of Object.entries(CHALLENGES)) {
        batch.set(doc(db, "challenges", id), data);
      }
    }

    if (gatheringsSnap.empty) {
      for (const [id, data] of Object.entries(GATHERINGS)) {
        batch.set(doc(db, "gatherings", id), data);
      }
    }

    if (!challengesSnap.empty && !gatheringsSnap.empty) return;

    await batch.commit();
  })();

  return seedPromise;
}

export async function ensureUserProfile(
  uid: string,
  name: string,
  avatarUrl?: string
) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid,
      name,
      level: 1,
      xp: 0,
      avatar_url: avatarUrl ?? "",
    });
  }
}
