"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { initAnalytics } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { seedFirestoreIfEmpty } from "@/lib/seed";
import {
  subscribeChallenges,
  subscribeGatherings,
  joinChallenge,
  joinGathering,
  createGathering,
  createChallenge,
  createChallengeFromActivity,
  addXp,
} from "@/lib/firestore";
import type { ChallengeDoc, GatheringDoc } from "@/lib/types";

export type ChallengeItem = { id: string } & ChallengeDoc & {
  isParticipant: boolean;
};
export type GatheringItem = { id: string } & GatheringDoc & { isJoined: boolean };

interface AppDataContextValue {
  isSoloMode: boolean;
  setIsSoloMode: Dispatch<SetStateAction<boolean>>;
  challenges: ChallengeItem[];
  gatherings: GatheringItem[];
  actionLoading: string | null;
  handleJoinChallenge: (id: string) => Promise<void>;
  handleJoinGathering: (id: string, isSecret?: boolean) => Promise<void>;
  handleCreateGathering: (e: React.FormEvent) => Promise<void>;
  handleCreateChallenge: (e: React.FormEvent) => Promise<void>;
  handleAddActivityToChallenges: (activity: {
    title: string;
    description: string;
  }) => Promise<void>;
  showModal: boolean;
  setShowModal: (open: boolean) => void;
  showChallengeModal: boolean;
  setShowChallengeModal: (open: boolean) => void;
  openChallengeModal: (title?: string) => void;
  openGatheringModal: (title?: string, description?: string) => void;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formMaxSpots: number;
  setFormMaxSpots: (v: number) => void;
  challengeTitle: string;
  setChallengeTitle: (v: string) => void;
  challengeTarget: number;
  setChallengeTarget: (v: number) => void;
  actionError: string | null;
  clearActionError: () => void;
  locationRevealed: boolean;
  setLocationRevealed: (v: boolean) => void;
  participantCount: number;
  joinedGatherings: number;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const uid = user!.uid;
  const displayName = profile?.name ?? "Путешественник";

  const [isSoloMode, setIsSoloMode] = useState(true);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [gatherings, setGatherings] = useState<GatheringItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("other");
  const [formMaxSpots, setFormMaxSpots] = useState(10);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeTarget, setChallengeTarget] = useState(10000);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [locationRevealed, setLocationRevealed] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    initAnalytics();
    seedFirestoreIfEmpty().then(() => setDataReady(true));
  }, []);

  useEffect(() => {
    if (!dataReady) return;
    const unsubC = subscribeChallenges(uid, setChallenges);
    const unsubG = subscribeGatherings(uid, setGatherings);
    return () => {
      unsubC();
      unsubG();
    };
  }, [uid, dataReady]);


  const clearActionError = useCallback(() => setActionError(null), []);

  const handleJoinChallenge = async (id: string) => {
    setActionLoading(id);
    setActionError(null);
    try {
      await joinChallenge(id, uid);
      await addXp(uid, 25);
    } catch (err) {
      setActionError(formatFirestoreError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoinGathering = async (id: string, isSecret?: boolean) => {
    setActionLoading(id);
    setActionError(null);
    try {
      await joinGathering(id, uid);
      await addXp(uid, 50);
      if (isSecret) setLocationRevealed(true);
    } catch (err) {
      setActionError(formatFirestoreError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateGathering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setActionLoading("create");
    setActionError(null);
    try {
      const categoryMap: Record<string, string> = {
        sport: "Спорт",
        camp: "Кемпинг",
        party: "Вечеринка",
        other: "Другое",
      };
      await createGathering(
        {
          title: formTitle.trim(),
          description: formDescription.trim(),
          date_time: "Скоро",
          max_spots: formMaxSpots,
          category: categoryMap[formCategory] ?? "Другое",
          emoji: "✨",
        },
        uid,
        displayName
      );
      setFormTitle("");
      setFormDescription("");
      setFormCategory("other");
      setFormMaxSpots(10);
      setShowModal(false);
    } catch (err) {
      setActionError(formatFirestoreError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTitle.trim()) return;
    setActionLoading("create-challenge");
    setActionError(null);
    try {
      await createChallenge(
        {
          title: challengeTitle.trim(),
          emoji: "🔥",
          type: "progress",
          target: challengeTarget,
          unit: "шагов",
          current_progress: 0,
        },
        uid,
        true
      );
      setChallengeTitle("");
      setChallengeTarget(10000);
      setShowChallengeModal(false);
    } catch (err) {
      setActionError(formatFirestoreError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddActivityToChallenges = async (activity: {
    title: string;
    description: string;
  }) => {
    setActionLoading("add-challenge");
    setActionError(null);
    try {
      await createChallengeFromActivity(activity, uid);
    } catch (err) {
      setActionError(formatFirestoreError(err));
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const openGatheringModal = useCallback(
    (title?: string, description?: string) => {
      clearActionError();
      if (title) setFormTitle(title);
      if (description) setFormDescription(description);
      setShowModal(true);
    },
    [clearActionError]
  );

  const openChallengeModal = useCallback(
    (title?: string) => {
      clearActionError();
      if (title) setChallengeTitle(title);
      setShowChallengeModal(true);
    },
    [clearActionError]
  );

  const participantCount = challenges.filter((c) => c.isParticipant).length;
  const joinedGatherings = gatherings.filter((g) => g.isJoined).length;

  return (
    <AppDataContext.Provider
      value={{
        isSoloMode,
        setIsSoloMode,
        challenges,
        gatherings,
        actionLoading,
        handleJoinChallenge,
        handleJoinGathering,
        handleCreateGathering,
        handleCreateChallenge,
        handleAddActivityToChallenges,
        showModal,
        setShowModal,
        showChallengeModal,
        setShowChallengeModal,
        openChallengeModal,
        openGatheringModal,
        formTitle,
        setFormTitle,
        formDescription,
        setFormDescription,
        formCategory,
        setFormCategory,
        formMaxSpots,
        setFormMaxSpots,
        challengeTitle,
        setChallengeTitle,
        challengeTarget,
        setChallengeTarget,
        actionError,
        clearActionError,
        locationRevealed,
        setLocationRevealed,
        participantCount,
        joinedGatherings,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

function formatFirestoreError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("permission-denied") || message.includes("Missing or insufficient permissions")) {
    return "Нет доступа к Firestore. Проверьте правила безопасности в Firebase Console.";
  }
  if (message.includes("unavailable")) {
    return "Firestore недоступен. Проверьте интернет и настройки Firebase.";
  }
  return "Не удалось сохранить в Firestore. Попробуйте снова.";
}
