import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  runTransaction,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { findUserByEmail } from "./users-search";
import type { FriendRequestDoc, UserProfile } from "./types";

export function subscribeIncomingRequests(
  uid: string,
  callback: (items: ({ id: string } & FriendRequestDoc)[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "friendRequests"),
    where("toUid", "==", uid),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as FriendRequestDoc) }))
    );
  });
}

export function subscribeFriends(
  uid: string,
  callback: (friends: UserProfile[]) => void
): Unsubscribe {
  return onSnapshot(doc(db, "users", uid), async (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const friendIds = (snap.data().friends as string[] | undefined) ?? [];
    if (friendIds.length === 0) {
      callback([]);
      return;
    }
    const profiles = await Promise.all(
      friendIds.map(async (fid) => {
        const fs = await getDoc(doc(db, "users", fid));
        if (!fs.exists()) return null;
        return { ...(fs.data() as UserProfile), uid: fid };
      })
    );
    callback(profiles.filter(Boolean) as UserProfile[]);
  });
}

export async function sendFriendRequest(
  fromUid: string,
  fromName: string,
  fromEmail: string | undefined,
  toEmail: string
): Promise<{ ok: boolean; message: string }> {
  const target = await findUserByEmail(toEmail);
  if (!target) {
    return { ok: false, message: "Пользователь не найден. Пусть зарегистрируется!" };
  }
  if (target.uid === fromUid) {
    return { ok: false, message: "Нельзя добавить себя в друзья" };
  }

  const mySnap = await getDoc(doc(db, "users", fromUid));
  const myFriends = (mySnap.data()?.friends as string[] | undefined) ?? [];
  if (myFriends.includes(target.uid)) {
    return { ok: false, message: `${target.name} уже в друзьях` };
  }

  const existing = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("fromUid", "==", fromUid),
      where("toUid", "==", target.uid),
      where("status", "==", "pending")
    )
  );
  if (!existing.empty) {
    return { ok: false, message: "Заявка уже отправлена" };
  }

  const reverse = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("fromUid", "==", target.uid),
      where("toUid", "==", fromUid),
      where("status", "==", "pending")
    )
  );
  if (!reverse.empty) {
    return {
      ok: false,
      message: `${target.name} уже отправил(а) вам заявку — примите в профиле!`,
    };
  }

  await addDoc(collection(db, "friendRequests"), {
    fromUid,
    fromName,
    fromEmail: fromEmail?.toLowerCase() ?? "",
    toUid: target.uid,
    toName: target.name,
    toEmail: toEmail.trim().toLowerCase(),
    status: "pending",
    createdAt: new Date().toISOString(),
  } satisfies FriendRequestDoc);

  return { ok: true, message: `Заявка отправлена ${target.name}!` };
}

export async function acceptFriendRequest(
  requestId: string,
  myUid: string
): Promise<void> {
  const reqRef = doc(db, "friendRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Заявка не найдена");
  const req = reqSnap.data() as FriendRequestDoc;
  if (req.toUid !== myUid || req.status !== "pending") {
    throw new Error("Нет доступа");
  }

  await runTransaction(db, async (tx) => {
    tx.update(reqRef, { status: "accepted" });
    tx.update(doc(db, "users", req.fromUid), {
      friends: arrayUnion(req.toUid),
    });
    tx.update(doc(db, "users", req.toUid), {
      friends: arrayUnion(req.fromUid),
    });
  });
}

export async function rejectFriendRequest(
  requestId: string,
  myUid: string
): Promise<void> {
  const reqRef = doc(db, "friendRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) return;
  const req = reqSnap.data() as FriendRequestDoc;
  if (req.toUid !== myUid) return;
  await updateDoc(reqRef, { status: "rejected" });
}

export async function removeFriend(
  myUid: string,
  friendUid: string
): Promise<void> {
  await runTransaction(db, async (tx) => {
    tx.update(doc(db, "users", myUid), {
      friends: arrayRemove(friendUid),
    });
    tx.update(doc(db, "users", friendUid), {
      friends: arrayRemove(myUid),
    });
  });
}
