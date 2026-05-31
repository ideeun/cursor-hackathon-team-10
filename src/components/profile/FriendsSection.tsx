"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, UserMinus, UserPlus, Users, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeIncomingRequests,
  subscribeFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "@/lib/friends-firestore";
import FriendEmailPicker, {
  type FriendEntry,
} from "@/components/quests/FriendEmailPicker";
import type { FriendRequestDoc, UserProfile } from "@/lib/types";

export default function FriendsSection() {
  const { user, profile } = useAuth();
  const uid = user!.uid;

  const [requests, setRequests] = useState<
    ({ id: string } & FriendRequestDoc)[]
  >([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const unsubReq = subscribeIncomingRequests(uid, setRequests);
    const unsubFriends = subscribeFriends(uid, (f) => {
      setFriends(f);
      setLoading(false);
    });
    return () => {
      unsubReq();
      unsubFriends();
    };
  }, [uid]);

  const handleSendRequest = async (entry: FriendEntry) => {
    const result = await sendFriendRequest(
      uid,
      profile?.name ?? "Пользователь",
      profile?.email,
      entry.email
    );
    setMessage(result.message);
  };

  const handleAccept = async (requestId: string) => {
    setActionId(requestId);
    try {
      await acceptFriendRequest(requestId, uid);
      setMessage("Друг добавлен! 🎉");
    } catch {
      setMessage("Не удалось принять заявку");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionId(requestId);
    await rejectFriendRequest(requestId, uid);
    setActionId(null);
  };

  const handleRemove = async (friendUid: string) => {
    setActionId(friendUid);
    try {
      await removeFriend(uid, friendUid);
      setMessage("Друг удалён");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="sf-card mt-4 p-5 text-left">
      <div className="mb-4 flex items-center gap-2">
        <Users size={18} className="text-peach-muted" />
        <h3 className="text-base font-semibold text-ink">Друзья</h3>
        {requests.length > 0 && (
          <span className="rounded-full bg-peach-muted px-2 py-0.5 text-[10px] font-semibold text-white">
            {requests.length} заявок
          </span>
        )}
      </div>

      {requests.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-xs font-medium text-ink-light">Входящие заявки</p>
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-peach-soft/60 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {req.fromName}
                </p>
                <p className="truncate text-xs text-ink-light">
                  {req.fromEmail || "хочет добавить вас в друзья"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={actionId === req.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white disabled:opacity-60"
                  aria-label="Принять"
                >
                  {actionId === req.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={actionId === req.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-ink-light"
                  aria-label="Отклонить"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-light">
          <UserPlus size={13} />
          Добавить друга по email
        </p>
        <FriendEmailPicker
          currentUid={uid}
          onAdd={handleSendRequest}
          placeholder="email друга..."
        />
      </div>

      {message && (
        <p className="mb-3 text-xs text-peach-deep">{message}</p>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-ink-light">
          Мои друзья ({loading ? "..." : friends.length})
        </p>
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="animate-spin text-peach-muted" />
          </div>
        )}
        {!loading && friends.length === 0 && (
          <p className="rounded-xl bg-stone-50 px-3 py-4 text-center text-xs text-ink-light">
            Пока нет друзей. Отправьте заявку по email!
          </p>
        )}
        <ul className="space-y-2">
          {friends.map((friend) => (
            <li
              key={friend.uid}
              className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach-soft text-sm font-semibold text-peach-deep">
                  {friend.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{friend.name}</p>
                  <p className="text-xs text-ink-light">{friend.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(friend.uid)}
                disabled={actionId === friend.uid}
                className="rounded-lg p-2 text-ink-faint hover:bg-red-50 hover:text-red-500"
                aria-label="Удалить из друзей"
              >
                {actionId === friend.uid ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserMinus size={16} />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
