"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Trophy,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeQuest,
  inviteFriendToQuest,
  uploadQuestPhoto,
  completeCheckpoint,
  startQuest,
} from "@/lib/quests-firestore";
import { getCurrentPosition, isWithinRadius } from "@/lib/geo";
import { addXp } from "@/lib/firestore";
import {
  formatDaysLeft,
  getQuestTypeEmoji,
  getQuestTypeLabel,
} from "@/lib/quest-templates";
import type { QuestDoc } from "@/lib/types";
import QuestMap from "./QuestMap";
import FriendEmailPicker from "./FriendEmailPicker";

interface QuestActiveViewProps {
  questId: string;
}

export default function QuestActiveView({ questId }: QuestActiveViewProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const uid = user!.uid;

  const [quest, setQuest] = useState<({ id: string } & QuestDoc) | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [atLocation, setAtLocation] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [invitedFriends, setInvitedFriends] = useState<
    { email: string; name?: string }[]
  >([]);

  useEffect(() => {
    const unsub = subscribeQuest(questId, (q) => {
      setQuest(q);
      setLoading(false);
    });
    return unsub;
  }, [questId]);

  const progress = quest?.participantProgress[uid];
  const currentIdx = progress?.currentCheckpoint ?? 0;
  const currentCheckpoint = quest?.checkpoints[currentIdx];
  const needsLocation =
    quest?.questType !== "monthly" &&
    currentCheckpoint?.requiresLocation !== false;
  const isFinished =
    progress?.finishedAt != null ||
    currentIdx >= (quest?.checkpoints.length ?? 0);

  const refreshLocation = useCallback(async () => {
    if (!currentCheckpoint) return;
    setLocLoading(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLat(lat);
      setUserLng(lng);
      const nearby = isWithinRadius(
        lat,
        lng,
        currentCheckpoint.lat,
        currentCheckpoint.lng,
        currentCheckpoint.radiusMeters
      );
      setAtLocation(nearby);
      if (!nearby) {
        setError(
          "Вы ещё не на месте. Подойдите ближе к точке (оранжевый круг на карте)."
        );
      }
    } catch {
      setError("Разрешите доступ к геолокации в браузере.");
    } finally {
      setLocLoading(false);
    }
  }, [currentCheckpoint]);

  useEffect(() => {
    setAtLocation(!needsLocation);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError(null);
  }, [currentIdx, needsLocation]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmitCheckpoint = async () => {
    if (!quest || !currentCheckpoint || !photoFile) return;
    if (!atLocation && needsLocation) {
      setError("Сначала подтвердите, что вы на месте.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const photoUrl = await uploadQuestPhoto(
        questId,
        uid,
        currentCheckpoint.order,
        photoFile
      );
      await completeCheckpoint(
        questId,
        uid,
        currentCheckpoint.order,
        photoUrl,
        quest.checkpoints.length,
        profile?.name
      );
      await addXp(uid, 40);
      setPhotoFile(null);
      setPhotoPreview(null);
      setAtLocation(false);
    } catch {
      setError("Не удалось загрузить фото. Проверьте Firebase Storage.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async (friend: { email: string; name?: string }) => {
    const result = await inviteFriendToQuest(questId, friend.email);
    setInviteMsg(result.message);
    if (result.added) {
      setInvitedFriends((prev) => [...prev, friend]);
    }
  };

  const handleStart = async () => {
    await startQuest(questId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-peach-muted" />
      </div>
    );
  }

  if (!quest) {
    return (
      <p className="sf-card px-4 py-8 text-center text-sm text-ink-light">
        Квест не найден
      </p>
    );
  }

  const leaderboard = quest.participants
    .map((pid) => ({
      uid: pid,
      name: quest.participantNames[pid] ?? "Игрок",
      progress: quest.participantProgress[pid],
    }))
    .sort((a, b) => {
      const aDone = a.progress?.finishedAt;
      const bDone = b.progress?.finishedAt;
      if (aDone && bDone)
        return (
          new Date(aDone).getTime() - new Date(bDone).getTime()
        );
      if (aDone) return -1;
      if (bDone) return 1;
      return (b.progress?.completedCount ?? 0) - (a.progress?.completedCount ?? 0);
    });

  return (
    <section className="space-y-4">
      <button
        onClick={() => router.push("/quests")}
        className="text-xs text-peach-deep hover:underline"
      >
        ← Все квесты
      </button>

      <div className="sf-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xl">
                {quest.emoji ?? getQuestTypeEmoji(quest.questType ?? "city")}
              </span>
              <span className="sf-badge px-2 py-0.5 text-[10px]">
                {getQuestTypeLabel(quest.questType ?? "city")}
              </span>
              {quest.endsAt && (
                <span className="flex items-center gap-1 text-[10px] text-ink-light">
                  <Clock size={11} />
                  {formatDaysLeft(quest.endsAt)} дн. осталось
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-ink">{quest.title}</h2>
            <p className="mt-0.5 text-xs text-ink-light">
              {quest.sport
                ? `🏃 ${quest.sport}`
                : quest.skill
                  ? `📚 ${quest.skill}`
                  : quest.district}{" "}
              · {quest.checkpoints.length}{" "}
              {quest.questType === "monthly" ? "недель" : "точек"}
            </p>
          </div>
          <span className="sf-badge shrink-0 px-2 py-0.5 text-[10px]">
            {quest.status === "completed"
              ? "Завершён"
              : quest.status === "active"
                ? "Идёт"
                : "Ожидание"}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-ink-light">
          <Users size={13} />
          {quest.participants.length} участник(ов)
        </div>
      </div>

      {quest.status === "waiting" && quest.creatorId === uid && (
        <div className="sf-card space-y-3 p-4">
          <p className="text-sm text-ink-light">
            Пригласите друга по email или начните в одиночку
          </p>
          <FriendEmailPicker
            currentUid={uid}
            addedFriends={invitedFriends}
            onAdd={handleInvite}
            placeholder="email друга..."
          />
          {inviteMsg && (
            <p className="text-xs text-peach-deep">{inviteMsg}</p>
          )}
          <button onClick={handleStart} className="sf-btn-primary w-full py-2.5 text-sm">
            Начать квест
          </button>
        </div>
      )}

      {!isFinished && currentCheckpoint && quest.status !== "waiting" && (
        <>
          <div className="sf-card overflow-hidden p-0">
            <div className="border-b border-sand px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-peach-deep">
                {currentCheckpoint.weekLabel ??
                  `Точка ${currentIdx + 1} из ${quest.checkpoints.length}`}
              </p>
              <h3 className="mt-1 font-medium text-ink">
                {currentCheckpoint.title}
              </h3>
              <p className="mt-1 text-sm text-ink-light">
                {currentCheckpoint.description}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                💡 {currentCheckpoint.hint}
              </p>
            </div>
            {needsLocation ? (
              <QuestMap
                lat={currentCheckpoint.lat}
                lng={currentCheckpoint.lng}
                userLat={userLat}
                userLng={userLng}
                radiusMeters={currentCheckpoint.radiusMeters}
                className="h-52 w-full"
              />
            ) : (
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-sky-50 to-peach-soft/40 px-4 text-center">
                <p className="text-sm text-ink-light">
                  📸 Сделайте фото прогресса — GPS не нужен
                </p>
              </div>
            )}
          </div>

          {needsLocation && (
            <div className="flex gap-2">
              <button
                onClick={refreshLocation}
                disabled={locLoading}
                className="sf-btn-soft flex flex-1 items-center justify-center gap-2 py-3 text-sm disabled:opacity-70"
              >
                {locLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Navigation size={16} />
                )}
                Проверить локацию
              </button>
              {atLocation && (
                <span className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={14} />
                  На месте!
                </span>
              )}
            </div>
          )}

          <div className="sf-card p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              <Camera size={16} className="text-peach-muted" />
              {needsLocation
                ? "Сфотографируйся на точке"
                : "Загрузите фото прогресса"}
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="w-full text-xs text-ink-light file:mr-3 file:rounded-lg file:border-0 file:bg-peach-soft file:px-3 file:py-2 file:text-xs file:font-medium file:text-peach-deep"
            />
            {photoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Превью"
                className="mt-3 h-40 w-full rounded-xl object-cover"
              />
            )}
            <button
              onClick={handleSubmitCheckpoint}
              disabled={submitting || !photoFile || (needsLocation && !atLocation)}
              className="sf-btn-primary mt-3 w-full py-3 text-sm disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={18} className="mx-auto animate-spin" />
              ) : (
                `✅ ${quest.questType === "monthly" ? "Завершить неделю" : "Подтвердить точку"} → дальше`
              )}
            </button>
          </div>
        </>
      )}

      {isFinished && (
        <div className="sf-card flex flex-col items-center gap-2 p-6 text-center">
          <Trophy size={40} className="text-peach-muted" />
          <h3 className="text-lg font-semibold text-ink">Квест пройден!</h3>
          {quest.winnerId && (
            <p className="text-sm text-ink-light">
              Победитель:{" "}
              <span className="font-medium text-peach-deep">
                {quest.participantNames[quest.winnerId] ?? "Вы"}
              </span>
            </p>
          )}
        </div>
      )}

      {error && <p className="sf-error px-3 py-2 text-xs">{error}</p>}

      <div className="sf-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-peach-muted" />
          <h3 className="text-sm font-semibold text-ink">Гонка с друзьями</h3>
        </div>
        <ul className="space-y-2">
          {leaderboard.map((entry, i) => {
            const p = entry.progress;
            const done = !!p?.finishedAt;
            return (
              <li
                key={entry.uid}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                  entry.uid === uid ? "bg-peach-soft" : "bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold text-peach-deep">
                    #{i + 1}
                  </span>
                  {entry.name}
                  {entry.uid === uid && (
                    <span className="text-[10px] text-ink-faint">(вы)</span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-xs text-ink-light">
                  {done ? (
                    <>
                      <Clock size={12} />
                      {new Date(p!.finishedAt!).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  ) : (
                    <>
                      <MapPin size={12} />
                      {p?.completedCount ?? 0}/{quest.checkpoints.length}
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
