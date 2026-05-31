"use client";

import { Loader2, X } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";

const inputClass = "sf-input w-full px-4 py-3 text-sm";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/20 backdrop-blur-sm lg:items-center lg:p-6">
      <div className="sf-card w-full max-w-md animate-in rounded-t-2xl p-6 lg:max-w-lg lg:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Новый челлендж</h3>
          <button
            onClick={() => setShowChallengeModal(false)}
            className="rounded-full bg-stone-100 p-2 text-ink-light transition-colors hover:bg-orange-50"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-light">
              Название
            </label>
            <input
              type="text"
              value={challengeTitle}
              onChange={(e) => setChallengeTitle(e.target.value)}
              placeholder="Например: 10 000 шагов за день"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-light">
              Цель (шагов / повторений)
            </label>
            <input
              type="number"
              min={100}
              max={100000}
              value={challengeTarget}
              onChange={(e) => setChallengeTarget(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          {actionError && (
            <p className="sf-error px-3 py-2 text-xs">{actionError}</p>
          )}
          <button
            type="submit"
            disabled={actionLoading === "create-challenge"}
            className="sf-btn-primary w-full py-3.5 text-sm disabled:opacity-70"
          >
            {actionLoading === "create-challenge" ? (
              <Loader2 size={18} className="mx-auto animate-spin" />
            ) : (
              "Создать челлендж"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
