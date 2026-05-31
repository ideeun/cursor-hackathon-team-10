"use client";

import { Loader2, X } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";

export default function ChallengeModal() {
  const {
    showChallengeModal,
    setShowChallengeModal,
    challengeTitle,
    setChallengeTitle,
    challengeTarget,
    setChallengeTarget,
    handleCreateChallenge,
    actionLoading,
    actionError,
  } = useAppData();

  if (!showChallengeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in rounded-t-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-800">Новый челлендж 🏃</h3>
          <button
            onClick={() => setShowChallengeModal(false)}
            className="rounded-full bg-stone-100 p-2 text-stone-500 transition-colors hover:bg-stone-200"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">
              Название
            </label>
            <input
              type="text"
              value={challengeTitle}
              onChange={(e) => setChallengeTitle(e.target.value)}
              placeholder="Например: 10 000 шагов за день"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">
              Цель (шагов / повторений)
            </label>
            <input
              type="number"
              min={100}
              max={100000}
              value={challengeTarget}
              onChange={(e) => setChallengeTarget(Number(e.target.value))}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          {actionError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
              {actionError}
            </p>
          )}
          <button
            type="submit"
            disabled={actionLoading === "create-challenge"}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
          >
            {actionLoading === "create-challenge" ? (
              <Loader2 size={18} className="mx-auto animate-spin" />
            ) : (
              "Создать челлендж 🚀"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
