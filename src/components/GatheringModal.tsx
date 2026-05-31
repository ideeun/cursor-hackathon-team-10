"use client";

import { Loader2, X } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";

const inputClass = "sf-input w-full px-4 py-3 text-sm";

export default function GatheringModal() {
  const {
    showModal,
    setShowModal,
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formCategory,
    setFormCategory,
    formMaxSpots,
    setFormMaxSpots,
    handleCreateGathering,
    actionLoading,
    actionError,
  } = useAppData();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/20 backdrop-blur-sm lg:items-center lg:p-6">
      <div className="sf-card w-full max-w-md animate-in rounded-t-2xl p-6 lg:max-w-lg lg:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Объявить сбор</h3>
          <button
            onClick={() => setShowModal(false)}
            className="rounded-full bg-stone-100 p-2 text-ink-light transition-colors hover:bg-orange-50"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleCreateGathering} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-light">
              Название
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Например: Поход на водопад"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-light">
              Описание
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Расскажи подробнее..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-light">
              Категория
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className={inputClass}
            >
              <option value="sport">Спорт</option>
              <option value="camp">Лагерь / Поход</option>
              <option value="party">Вечеринка</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-light">
              Макс. участников
            </label>
            <input
              type="number"
              min={2}
              max={50}
              value={formMaxSpots}
              onChange={(e) => setFormMaxSpots(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          {actionError && (
            <p className="sf-error px-3 py-2 text-xs">{actionError}</p>
          )}
          <button
            type="submit"
            disabled={actionLoading === "create"}
            className="sf-btn-primary w-full py-3.5 text-sm disabled:opacity-70"
          >
            {actionLoading === "create" ? (
              <Loader2 size={18} className="mx-auto animate-spin" />
            ) : (
              "Опубликовать"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
