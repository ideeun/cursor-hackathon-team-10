"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, MapPinned } from "lucide-react";
import { ACTIVITIES, SECRET_EVENT } from "@/lib/activities";
import { useAppData } from "@/contexts/AppDataContext";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import CountdownTimer from "@/components/ui/CountdownTimer";
import type { Activity, ActivityMode } from "@/lib/types";

type AiResult =
  | (Activity & { isSecret?: false })
  | (typeof SECRET_EVENT & { isSecret: true });

export default function HomePage() {
  const router = useRouter();
  const {
    isSoloMode,
    setIsSoloMode,
    gatherings,
    actionLoading,
    handleJoinGathering,
    handleAddActivityToChallenges,
    openGatheringModal,
    locationRevealed,
    actionError,
  } = useAppData();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [secretFlash, setSecretFlash] = useState(false);

  const handleBoredClick = () => {
    setAiLoading(true);
    setAiResult(null);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 100) + 1;
      const isSecret = roll <= 5;

      if (isSecret) {
        setSecretFlash(true);
        setTimeout(() => setSecretFlash(false), 1200);
        setAiResult({ ...SECRET_EVENT, isSecret: true });
      } else {
        const mode: ActivityMode = isSoloMode ? "solo" : "friends";
        const filtered = ACTIVITIES.filter((a) => a.mode === mode);
        const random =
          filtered[Math.floor(Math.random() * filtered.length)] ?? filtered[0];
        setAiResult(random);
      }
      setAiLoading(false);
    }, 1000);
  };

  return (
    <>
      {secretFlash && <div className="secret-flash-overlay" aria-hidden />}

      <div className="mb-4 flex justify-center">
        <ToggleSwitch
          isSolo={isSoloMode}
          onToggle={() => {
            setIsSoloMode((v) => !v);
            setAiResult(null);
          }}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          <h2 className="text-base font-bold text-stone-800">
            AI-генератор активностей
          </h2>
        </div>

        <button
          onClick={handleBoredClick}
          disabled={aiLoading}
          className="animate-pulse-glow w-full rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-5 text-xl font-black tracking-wide text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-80"
        >
          {aiLoading ? (
            <span className="flex items-center justify-center gap-3 text-base">
              <Loader2 size={22} className="animate-spin-slow" />
              AI подбирает активность...
            </span>
          ) : (
            "МНЕ СКУЧНО! 🌴"
          )}
        </button>

        {aiLoading && (
          <div className="space-y-2 rounded-3xl border border-orange-100 bg-white p-5 shadow-lg">
            <div className="h-4 w-3/4 animate-pulse rounded-lg bg-orange-100" />
            <div className="h-3 w-full animate-pulse rounded-lg bg-stone-100" />
            <div className="h-3 w-5/6 animate-pulse rounded-lg bg-stone-100" />
          </div>
        )}

        {aiResult && !aiLoading && (
          <div
            className={`space-y-3 rounded-3xl border p-5 shadow-lg transition-all duration-300 animate-in ${
              aiResult.isSecret
                ? "secret-card border-transparent bg-gradient-to-br from-amber-50 to-orange-50"
                : "border-orange-100 bg-white"
            }`}
          >
            {aiResult.isSecret && (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600">
                <Sparkles size={14} />
                Эксклюзив — 5% шанс!
              </div>
            )}
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-stone-800">
                {aiResult.title}
              </h3>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-600">
                {aiResult.mode === "solo" ? "Соло" : "С друзьями"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-600">
              {aiResult.description}
            </p>
            {aiResult.isSecret && (
              <>
                <div className="flex items-center gap-2 rounded-2xl bg-amber-100/80 px-3 py-2 text-sm font-semibold text-amber-800">
                  <MapPinned size={15} />
                  {locationRevealed
                    ? SECRET_EVENT.revealedLocation
                    : SECRET_EVENT.hiddenLocation}
                </div>
                <CountdownTimer until={SECRET_EVENT.availableUntil} />
              </>
            )}
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2">
              <span className="text-xs text-stone-500">Бюджет:</span>
              <span className="text-sm font-bold text-emerald-700">
                {aiResult.budget}
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={async () => {
                  try {
                    await handleAddActivityToChallenges({
                      title: aiResult.title,
                      description: aiResult.description,
                    });
                    router.push("/challenges");
                  } catch {
                    // error shown in banner
                  }
                }}
                disabled={actionLoading === "add-challenge"}
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-70"
              >
                {actionLoading === "add-challenge" ? (
                  <Loader2 size={14} className="mx-auto animate-spin" />
                ) : (
                  "В челленджи 🏃‍♂️"
                )}
              </button>
              <button
                onClick={() => {
                  openGatheringModal(aiResult.title, aiResult.description);
                  router.push("/gatherings");
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
              >
                Собрать компанию 👥
              </button>
            </div>
            {aiResult.isSecret && (
              <button
                onClick={() => handleJoinGathering("secret_camp_007", true)}
                disabled={
                  actionLoading === "secret_camp_007" ||
                  gatherings.find((g) => g.id === "secret_camp_007")?.isJoined
                }
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-red-500 to-yellow-500 py-3 text-sm font-black text-white shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
              >
                {gatherings.find((g) => g.id === "secret_camp_007")?.isJoined
                  ? "Вы в деле! 🎒"
                  : "Я В ДЕЛЕ! 🎒"}
              </button>
            )}
          </div>
        )}
        {actionError && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
            {actionError}
          </p>
        )}
      </section>
    </>
  );
}
