"use client";

import { useState } from "react";
import { Loader2, MapPin, Sparkles, Users, X } from "lucide-react";
import { BISHKEK_DISTRICTS } from "@/lib/bishkek-quests";
import { createQuest } from "@/lib/quests-firestore";
import FriendEmailPicker, {
  type FriendEntry,
} from "@/components/quests/FriendEmailPicker";

interface CreateQuestModalProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  userName: string;
  onCreated: (questId: string) => void;
}

export default function CreateQuestModal({
  open,
  onClose,
  uid,
  userName,
  onCreated,
}: CreateQuestModalProps) {
  const [district, setDistrict] = useState<string>(BISHKEK_DISTRICTS[0]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "generating">("form");

  if (!open) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStep("generating");
    try {
      const res = await fetch("/api/quests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district }),
      });
      const data = await res.json();

      const questId = await createQuest({
        title: data.title,
        district,
        checkpoints: data.checkpoints,
        creatorId: uid,
        creatorName: userName,
        invitedEmails: friends.map((f) => f.email),
      });

      onCreated(questId);
      onClose();
      setFriends([]);
      setStep("form");
    } catch {
      setError("Не удалось создать квест. Попробуйте снова.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="sf-card w-full max-w-md p-5 shadow-xl">
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
            <p className="text-sm text-ink-light">
              AI генерирует маршрут по району {district}...
            </p>
            <p className="text-xs text-ink-faint">
              Фонтан у ЦУМа → фото → следующая точка
            </p>
          </div>
        ) : (
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

            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-light">
              <Users size={13} />
              Пригласить друга
            </label>
            <FriendEmailPicker
              currentUid={uid}
              addedFriends={friends}
              onAdd={(friend) =>
                setFriends((prev) => [...prev, friend])
              }
              onRemove={(email) =>
                setFriends((prev) =>
                  prev.filter((f) => f.email !== email)
                )
              }
            />

            <div className="mb-4 mt-3 flex items-start gap-2 rounded-xl bg-peach-soft px-3 py-2.5 text-xs text-peach-deep">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span>
                Начните вводить email — появятся зарегистрированные друзья.
                Добавляйте по одному.
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
                "🗺️ Сгенерировать квест"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
