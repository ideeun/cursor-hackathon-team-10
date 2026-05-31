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

export async function joinGathering(gatheringId: string, uid: string) {
  const ref = doc(db, "gatherings", gatheringId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Сбор не найден");
    const data = snap.data() as GatheringDoc;
    if (data.attendees.includes(uid)) return;
    if (data.spots_left <= 0) throw new Error("Мест больше нет");
    tx.update(ref, {
      attendees: arrayUnion(uid),
      spots_left: increment(-1),
    });
  });
}

export async function createGathering(
  data: Omit<GatheringDoc, "attendees" | "spots_left"> & { max_spots: number },
  hostId: string,
  hostName: string
) {
  await addDoc(collection(db, "gatherings"), {
    ...data,
    host_id: hostId,
    host_name: hostName,
    attendees: [hostId],
    spots_left: Math.max(0, data.max_spots - 1),
    join_label: data.join_label ?? "Присоединиться",
  });
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
