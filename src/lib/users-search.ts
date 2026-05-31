import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserSearchResult {
  uid: string;
  name: string;
  email: string;
}

export async function searchUsersByEmailPrefix(
  searchTerm: string,
  excludeUid: string,
  maxResults = 6
): Promise<UserSearchResult[]> {
  const term = searchTerm.trim().toLowerCase();
  if (term.length < 2) return [];

  const q = query(
    collection(db, "users"),
    where("email", ">=", term),
    where("email", "<=", term + "\uf8ff"),
    limit(maxResults + 5)
  );

  const snap = await getDocs(q);
  const results: UserSearchResult[] = [];

  for (const d of snap.docs) {
    if (d.id === excludeUid) continue;
    const data = d.data();
    const email = (data.email as string) ?? "";
    if (!email) continue;
    results.push({
      uid: d.id,
      name: (data.name as string) ?? email.split("@")[0],
      email,
    });
    if (results.length >= maxResults) break;
  }

  return results;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function findUserByEmail(
  email: string
): Promise<{ uid: string; name: string } | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const q = query(
    collection(db, "users"),
    where("email", "==", normalized)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  return { uid: snap.docs[0].id, name: data.name ?? normalized.split("@")[0] };
}
