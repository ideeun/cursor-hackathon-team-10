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
  showModal: boolean;
  setShowModal: (open: boolean) => void;
  openGatheringModal: (title?: string, description?: string) => void;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formMaxSpots: number;
  setFormMaxSpots: (v: number) => void;
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
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("other");
  const [formMaxSpots, setFormMaxSpots] = useState(10);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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


  const handleJoinChallenge = async (id: string) => {
    setActionLoading(id);
    try {
      await joinChallenge(id, uid);
      await addXp(uid, 25);
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoinGathering = async (id: string, isSecret?: boolean) => {
    setActionLoading(id);
    try {
      await joinGathering(id, uid);
      await addXp(uid, 50);
      if (isSecret) setLocationRevealed(true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateGathering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setActionLoading("create");
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
          host_name: displayName,
          host_id: uid,
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
    } finally {
      setActionLoading(null);
    }
  };

  const openGatheringModal = useCallback(
    (title?: string, description?: string) => {
      if (title) setFormTitle(title);
      if (description) setFormDescription(description);
      setShowModal(true);
    },
    []
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
        showModal,
        setShowModal,
        openGatheringModal,
        formTitle,
        setFormTitle,
        formDescription,
        setFormDescription,
        formCategory,
        setFormCategory,
        formMaxSpots,
        setFormMaxSpots,
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
