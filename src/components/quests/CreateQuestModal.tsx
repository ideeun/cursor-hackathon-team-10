"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Sparkles, Users, X } from "lucide-react";
import { BISHKEK_DISTRICTS } from "@/lib/bishkek-quests";
import { createQuest } from "@/lib/quests-firestore";
import { subscribeFriends } from "@/lib/friends-firestore";
import {
  SPORT_OPTIONS,
  SKILL_OPTIONS,
} from "@/lib/quest-templates";
import type { QuestType, UserProfile } from "@/lib/types";

interface CreateQuestModalProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  userName: string;
  onCreated: (questId: string) => void;
}

const QUEST_TYPES: { id: QuestType; label: string; emoji: string; desc: string }[] = [
  { id: "city", label: "Городской", emoji: "🗺️", desc: "Точки по Бишкеку" },
  { id: "sport", label: "Спорт", emoji: "🏃", desc: "С друзьями на площадках" },
  { id: "monthly", label: "На месяц", emoji: "📚", desc: "Научиться за 30 дней" },
];

export default function CreateQuestModal({
  open,
  onClose,
  uid,
  userName,
  onCreated,
}: CreateQuestModalProps) {
  const [questType, setQuestType] = useState<QuestType>("city");
  const [district, setDistrict] = useState<string>(BISHKEK_DISTRICTS[0]);
  const [sport, setSport] = useState<string>(SPORT_OPTIONS[0].id);
  const [skill, setSkill] = useState<string>(SKILL_OPTIONS[0].id);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [selectedFriendUids, setSelectedFriendUids] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "generating">("form");

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeFriends(uid, setFriends);
    return unsub;
  }, [open, uid]);

  if (!open) return null;

  const toggleFriend = (friendUid: string) => {
    setSelectedFriendUids((prev) =>
      prev.includes(friendUid)
        ? prev.filter((id) => id !== friendUid)
        : [...prev, friendUid]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStep("generating");
    try {
      const res = await fetch("/api/quests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, questType, sport, skill }),
      });
      const data = await res.json();

      const questId = await createQuest({
        title: data.title,
        district,
        questType: data.questType ?? questType,
        sport: data.sport,
        skill: data.skill,
        emoji: data.emoji,
        endsAt: data.endsAt,
        checkpoints: data.checkpoints,
        creatorId: uid,
        creatorName: userName,
        invitedEmails: [],
        friendUids: selectedFriendUids,
      });

      onCreated(questId);
      onClose();
      setSelectedFriendUids([]);
      setStep("form");
    } catch {
      setError("Не удалось создать квест. Попробуйте снова.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const generatingText =
    questType === "sport"
      ? "AI собирает спорт-маршрут с друзьями..."
      : questType === "monthly"
        ? "AI строит план обучения на 30 дней..."
        : `AI генерирует маршрут по району ${district}...`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="sf-card max-h-[90vh] w-full max-w-md overflow-y-auto p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-peach-muted" />
            <h3 className="text-base font-semibold text-ink">Новый квест</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-ink-faint hover:bg-stone-100"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {step === "generating" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 size={32} className="animate-spin text-peach-muted" />
            <p className="text-sm text-ink-light">{generatingText}</p>
          </div>
        ) : (
          <>
            <label className="mb-2 block text-xs font-medium text-ink-light">
              Тип квеста
            </label>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {QUEST_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQuestType(t.id)}
                  className={`rounded-xl border p-2.5 text-center transition-colors ${
                    questType === t.id
                      ? "border-peach-muted bg-peach-soft"
                      : "border-sand bg-white hover:border-orange-200"
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <p className="mt-1 text-[11px] font-semibold text-ink">{t.label}</p>
                  <p className="mt-0.5 text-[9px] text-ink-faint">{t.desc}</p>
                </button>
              ))}
            </div>

            {questType === "city" && (
              <>
                <label className="mb-1 block text-xs font-medium text-ink-light">
                  Район Бишкека
                </label>
                <div className="mb-4 flex flex-wrap gap-2">
                  {BISHKEK_DISTRICTS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDistrict(d)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        district === d
                          ? "bg-peach-muted text-white"
                          : "bg-stone-100 text-ink-light hover:bg-orange-100"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}

            {questType === "sport" && (
              <>
                <label className="mb-2 block text-xs font-medium text-ink-light">
                  Вид спорта
                </label>
                <div className="mb-4 flex flex-wrap gap-2">
                  {SPORT_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSport(s.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        sport === s.id
                          ? "bg-peach-muted text-white"
                          : "bg-stone-100 text-ink-light hover:bg-orange-100"
                      }`}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {questType === "monthly" && (
              <>
                <label className="mb-2 block text-xs font-medium text-ink-light">
                  Чему научиться за месяц?
                </label>
                <div className="mb-4 flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkill(s.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        skill === s.id
                          ? "bg-peach-muted text-white"
                          : "bg-stone-100 text-ink-light hover:bg-orange-100"
                      }`}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
                <p className="mb-4 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-800">
                  📅 4 недели · 4 этапа · соревнуйтесь с друзьями кто быстрее
                  освоит навык
                </p>
              </>
            )}

            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-light">
              <Users size={13} />
              Пригласить друзей в квест
            </label>
            {friends.length === 0 ? (
              <p className="mb-4 rounded-xl bg-stone-50 px-3 py-3 text-xs text-ink-light">
                Друзей пока нет — добавьте их в{" "}
                <span className="font-medium text-peach-deep">Профиле</span>, потом
                создайте квест вместе!
              </p>
            ) : (
              <div className="mb-4 flex flex-wrap gap-2">
                {friends.map((f) => {
                  const selected = selectedFriendUids.includes(f.uid);
                  return (
                    <button
                      key={f.uid}
                      type="button"
                      onClick={() => toggleFriend(f.uid)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selected
                          ? "border-peach-muted bg-peach-soft text-peach-deep"
                          : "border-sand bg-white text-ink-light hover:border-orange-200"
                      }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-[10px] font-bold text-ink">
                        {f.name.charAt(0).toUpperCase()}
                      </span>
                      {f.name}
                      {selected && " ✓"}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mb-4 flex items-start gap-2 rounded-xl bg-peach-soft px-3 py-2.5 text-xs text-peach-deep">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span>
                {questType === "monthly"
                  ? "Еженедельные этапы — фото прогресса, без GPS"
                  : questType === "sport"
                    ? "Спортивные точки в Бишкеке — команда против команды!"
                    : "Городской квест — найди точку, сфоткайся, следующая!"}
              </span>
            </div>

            {error && (
              <p className="sf-error mb-3 px-3 py-2 text-xs">{error}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="sf-btn-primary w-full py-3 text-sm disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={18} className="mx-auto animate-spin" />
              ) : (
                `${QUEST_TYPES.find((t) => t.id === questType)?.emoji ?? "🗺️"} Создать квест`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
