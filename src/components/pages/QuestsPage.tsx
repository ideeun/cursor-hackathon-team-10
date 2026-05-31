"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Plus, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeMyQuests } from "@/lib/quests-firestore";
import type { QuestDoc } from "@/lib/types";
import CreateQuestModal from "@/components/quests/CreateQuestModal";
import QuestCard from "@/components/quests/QuestCard";

export default function QuestsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const uid = user!.uid;
  const userName = profile?.name ?? "Игрок";

  const [quests, setQuests] = useState<({ id: string } & QuestDoc)[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const unsub = subscribeMyQuests(uid, (items) => {
      setQuests(items);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 lg:hidden">
          <Sparkles size={18} className="text-peach-muted" />
          <div>
            <h2 className="text-base font-semibold text-ink">
              Городские квесты
            </h2>
            <p className="text-xs text-ink-light">Бишкек · AI-маршруты</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="sf-btn-primary flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm"
        >
          <Plus size={16} />
          Новый квест
        </button>
      </div>

      <div className="sf-card bg-gradient-to-br from-peach-soft to-white p-4 sm:p-5">
        <p className="text-sm font-medium text-ink sm:text-base">
          🗺️ Город · 🏃 Спорт с друзьями · 📚 Научиться за месяц
        </p>
        <p className="mt-1 text-xs text-ink-light sm:text-sm">
          Добавь друзей в профиле, выбери тип квеста и соревнуйтесь — кто
          быстрее пройдёт маршрут или освоит навык!
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-peach-muted" />
        </div>
      )}

      {!loading && quests.length === 0 && (
        <div className="sf-card px-4 py-14 text-center sm:py-16">
          <MapPin size={36} className="mx-auto text-peach-muted" />
          <p className="mt-4 text-sm text-ink-light sm:text-base">
            Квестов пока нет. Создайте первый и пригласите друзей по email!
          </p>
        </div>
      )}

      {!loading && quests.length > 0 && (
        <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {quests.map((quest) => (
            <li key={quest.id}>
              <QuestCard
                quest={quest}
                uid={uid}
                onClick={() => router.push(`/quests/${quest.id}`)}
              />
            </li>
          ))}
        </ul>
      )}

      <CreateQuestModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        uid={uid}
        userName={userName}
        onCreated={(id) => router.push(`/quests/${id}`)}
      />
    </section>
  );
}
