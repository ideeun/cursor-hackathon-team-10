import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  addDoc,
  arrayUnion,
  increment,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ChallengeDoc, GatheringDoc } from "./types";

export function subscribeChallenges(
  uid: string | undefined,
  callback: (
    items: ({ id: string } & ChallengeDoc & { isParticipant: boolean })[]
  ) => void
): Unsubscribe {
  return onSnapshot(collection(db, "challenges"), (snap) => {
    const items = snap.docs.map((d) => {
      const data = d.data() as ChallengeDoc;
      return {
        id: d.id,
        ...data,
        isParticipant: uid ? data.participants.includes(uid) : false,
      };
    });
    callback(items);
  });
}

export function subscribeGatherings(
  uid: string | undefined,
  callback: (
    items: ({ id: string } & GatheringDoc & { isJoined: boolean })[]
  ) => void
): Unsubscribe {
  return onSnapshot(collection(db, "gatherings"), (snap) => {
    const items = snap.docs.map((d) => {
      const data = d.data() as GatheringDoc;
      return {
        id: d.id,
        ...data,
        isJoined: uid ? data.attendees.includes(uid) : false,
      };
    });
    callback(items);
  });
}

export async function joinChallenge(challengeId: string, uid: string) {
  const ref = doc(db, "challenges", challengeId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const data = snap.data() as ChallengeDoc;
    if (data.participants.includes(uid)) return;
    tx.update(ref, {
      participants: arrayUnion(uid),
      status: "in_progress",
    });
  });
}

export async function joinGathering(
  gatheringId: string,
  uid: string,
  attendee: { name: string; email?: string }
) {
  const ref = doc(db, "gatherings", gatheringId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Сбор не найден");
    const data = snap.data() as GatheringDoc;
    if (data.attendees.includes(uid)) return;
    if (data.spots_left <= 0) throw new Error("Мест больше нет");
    const update: Record<string, unknown> = {
      attendees: arrayUnion(uid),
      spots_left: increment(-1),
      [`attendeeNames.${uid}`]: attendee.name,
    };
    const email = attendee.email?.trim().toLowerCase();
    if (email) {
      update[`attendeeEmails.${uid}`] = email;
    }
    tx.update(ref, update);
  });
}

export async function createGathering(
  data: Omit<GatheringDoc, "attendees" | "spots_left" | "host_id" | "host_name"> & {
    max_spots: number;
  },
  hostId: string,
  hostName: string,
  hostEmail?: string
) {
  await addDoc(collection(db, "gatherings"), {
    title: data.title,
    description: data.description,
    date_time: data.date_time,
    max_spots: data.max_spots,
    category: data.category,
    emoji: data.emoji,
    join_label: data.join_label ?? "Присоединиться",
    is_secret: data.is_secret,
    secret_chance: data.secret_chance,
    available_until: data.available_until,
    hidden_location: data.hidden_location,
    host_id: hostId,
    host_name: hostName,
    attendees: [hostId],
    attendeeNames: { [hostId]: hostName },
    ...(hostEmail
      ? { attendeeEmails: { [hostId]: hostEmail.trim().toLowerCase() } }
      : {}),
    spots_left: Math.max(0, data.max_spots - 1),
  });
}

export async function createChallenge(
  data: Omit<ChallengeDoc, "participants" | "status">,
  uid: string,
  autoJoin = true
) {
  await addDoc(collection(db, "challenges"), {
    ...data,
    participants: autoJoin ? [uid] : [],
    status: autoJoin ? "in_progress" : "available",
    current_progress: data.current_progress ?? 0,
  });
}

export async function createChallengeFromActivity(
  activity: { title: string; description: string },
  uid: string
) {
  await createChallenge(
    {
      title: activity.title,
      description: activity.description,
      emoji: "🎯",
      type: "status",
    },
    uid,
    true
  );
}

export async function addXp(uid: string, amount: number) {
  const ref = doc(db, "users", uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const current = snap.data();
    const newXp = (current.xp ?? 0) + amount;
    const newLevel = Math.floor(newXp / 150) + 1;
    tx.update(ref, { xp: newXp, level: newLevel });
  });
}
