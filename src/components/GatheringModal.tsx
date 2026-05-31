"use client";

import { Loader2, X } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in rounded-t-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-800">Объявить сбор ✨</h3>
          <button
            onClick={() => setShowModal(false)}
            className="rounded-full bg-stone-100 p-2 text-stone-500 transition-colors hover:bg-stone-200"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleCreateGathering} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">
              Название
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Например: Поход на водопад"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">
              Описание
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Расскажи подробнее..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">
              Категория
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            >
              <option value="sport">Спорт</option>
              <option value="camp">Лагерь / Поход</option>
              <option value="party">Вечеринка</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">
              Макс. участников
            </label>
            <input
              type="number"
              min={2}
              max={50}
              value={formMaxSpots}
              onChange={(e) => setFormMaxSpots(Number(e.target.value))}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          {actionError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
              {actionError}
            </p>
          )}
          <button
            type="submit"
            disabled={actionLoading === "create"}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
          >
            {actionLoading === "create" ? (
              <Loader2 size={18} className="mx-auto animate-spin" />
            ) : (
              "Опубликовать 🚀"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
