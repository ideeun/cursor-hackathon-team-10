import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  arrayUnion,
  type Unsubscribe,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { findUserByEmail } from "./users-search";
import type {
  QuestDoc,
  QuestParticipantProgress,
  QuestCheckpoint,
  QuestType,
} from "./types";

function omitUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitUndefined(item)) as T;
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, omitUndefined(v)])
    ) as T;
  }
  return value;
}

export function subscribeMyQuests(
  uid: string,
  callback: (items: ({ id: string } & QuestDoc)[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "quests"),
    where("participants", "array-contains", uid)
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as QuestDoc),
    }));
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    callback(items);
  });
}

export function subscribeQuest(
  questId: string,
  callback: (quest: ({ id: string } & QuestDoc) | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "quests", questId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...(snap.data() as QuestDoc) });
  });
}

export async function createQuest(params: {
  title: string;
  district: string;
  questType: QuestType;
  sport?: string;
  skill?: string;
  emoji?: string;
  endsAt?: string;
  checkpoints: QuestCheckpoint[];
  creatorId: string;
  creatorName: string;
  invitedEmails: string[];
  friendUids?: string[];
}): Promise<string> {
  const participants = [params.creatorId];
  const participantNames: Record<string, string> = {
    [params.creatorId]: params.creatorName,
  };
  const notFoundEmails: string[] = [];

  for (const fid of params.friendUids ?? []) {
    if (fid === params.creatorId || participants.includes(fid)) continue;
    const fs = await getDoc(doc(db, "users", fid));
    if (fs.exists()) {
      const name = (fs.data().name as string) ?? "Друг";
      participants.push(fid);
      participantNames[fid] = name;
    }
  }

  for (const email of params.invitedEmails) {
    const friend = await findUserByEmail(email);
    if (friend && !participants.includes(friend.uid)) {
      participants.push(friend.uid);
      participantNames[friend.uid] = friend.name;
    } else if (!friend) {
      notFoundEmails.push(email.trim().toLowerCase());
    }
  }

  const now = new Date().toISOString();
  const participantProgress: Record<string, QuestParticipantProgress> = {};
  for (const pid of participants) {
    participantProgress[pid] = {
      currentCheckpoint: 0,
      startedAt: now,
      completedCount: 0,
      checkpointPhotos: {},
    };
  }

  const docRef = await addDoc(
    collection(db, "quests"),
    omitUndefined({
      title: params.title,
      creatorId: params.creatorId,
      creatorName: params.creatorName,
      district: params.district,
      questType: params.questType,
      sport: params.sport,
      skill: params.skill,
      emoji: params.emoji,
      endsAt: params.endsAt,
      status: participants.length > 1 ? "active" : "waiting",
      participants,
      participantNames,
      invitedEmails: notFoundEmails,
      checkpoints: params.checkpoints,
      participantProgress,
      createdAt: now,
      startedAt: participants.length > 1 ? now : undefined,
    }) satisfies QuestDoc
  );

  return docRef.id;
}

export async function startQuest(questId: string) {
  await updateDoc(doc(db, "quests", questId), {
    status: "active",
    startedAt: new Date().toISOString(),
  });
}

export async function inviteFriendToQuest(
  questId: string,
  email: string
): Promise<{ added: boolean; message: string }> {
  const friend = await findUserByEmail(email);
  if (!friend) {
    return {
      added: false,
      message: "Пользователь с таким email не найден. Пусть зарегистрируется!",
    };
  }

  const now = new Date().toISOString();
  await updateDoc(doc(db, "quests", questId), {
    participants: arrayUnion(friend.uid),
    [`participantNames.${friend.uid}`]: friend.name,
    [`participantProgress.${friend.uid}`]: {
      currentCheckpoint: 0,
      startedAt: now,
      completedCount: 0,
      checkpointPhotos: {},
    },
    status: "active",
    startedAt: now,
  });

  return { added: true, message: `${friend.name} добавлен в квест!` };
}

export async function uploadQuestPhoto(
  questId: string,
  uid: string,
  checkpointOrder: number,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const storageRef = ref(
    storage,
    `quests/${questId}/${uid}/checkpoint-${checkpointOrder}.${ext}`
  );
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function completeCheckpoint(
  questId: string,
  uid: string,
  checkpointOrder: number,
  photoUrl: string,
  totalCheckpoints: number,
  participantName?: string
) {
  const questRef = doc(db, "quests", questId);
  const nextCheckpoint = checkpointOrder + 1;
  const isFinished = nextCheckpoint >= totalCheckpoints;

  const progressUpdate: Record<string, unknown> = {
    [`participantProgress.${uid}.currentCheckpoint`]: nextCheckpoint,
    [`participantProgress.${uid}.completedCount`]: nextCheckpoint,
    [`participantProgress.${uid}.checkpointPhotos.${checkpointOrder}`]:
      photoUrl,
  };

  if (isFinished) {
    progressUpdate[`participantProgress.${uid}.finishedAt`] =
      new Date().toISOString();
  }

  await updateDoc(questRef, progressUpdate);

  if (isFinished) {
    const snap = await getDoc(questRef);
    const data = snap.data() as QuestDoc | undefined;
    if (data && !data.winnerId) {
      await updateDoc(questRef, {
        winnerId: uid,
        winnerName: participantName ?? data.participantNames[uid] ?? "Игрок",
      });
    }
  }
}
