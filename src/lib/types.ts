export type ActivityMode = "solo" | "friends";

export interface Activity {
  id: string;
  title: string;
  description: string;
  budget: string;
  mode: ActivityMode;
}

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  level: number;
  xp: number;
  avatar_url?: string;
  friends?: string[];
}

export interface FriendRequestDoc {
  fromUid: string;
  fromName: string;
  fromEmail?: string;
  toUid: string;
  toName: string;
  toEmail?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export type QuestType = "city" | "sport" | "monthly";

export interface QuestCheckpoint {
  order: number;
  title: string;
  description: string;
  hint: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  requiresLocation?: boolean;
  weekLabel?: string;
}

export interface QuestParticipantProgress {
  currentCheckpoint: number;
  startedAt: string;
  completedCount: number;
  finishedAt?: string;
  checkpointPhotos: Record<string, string>;
}

export interface QuestDoc {
  title: string;
  creatorId: string;
  creatorName: string;
  district: string;
  questType: QuestType;
  sport?: string;
  skill?: string;
  emoji?: string;
  endsAt?: string;
  status: "waiting" | "active" | "completed";
  participants: string[];
  participantNames: Record<string, string>;
  invitedEmails: string[];
  checkpoints: QuestCheckpoint[];
  participantProgress: Record<string, QuestParticipantProgress>;
  createdAt: string;
  startedAt?: string;
  winnerId?: string;
  winnerName?: string;
}

export interface QuestCheckpoint {
  order: number;
  title: string;
  description: string;
  hint: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface QuestParticipantProgress {
  currentCheckpoint: number;
  startedAt: string;
  completedCount: number;
  finishedAt?: string;
  checkpointPhotos: Record<string, string>;
}

export interface QuestDoc {
  title: string;
  creatorId: string;
  creatorName: string;
  district: string;
  status: "waiting" | "active" | "completed";
  participants: string[];
  participantNames: Record<string, string>;
  invitedEmails: string[];
  checkpoints: QuestCheckpoint[];
  participantProgress: Record<string, QuestParticipantProgress>;
  createdAt: string;
  startedAt?: string;
  winnerId?: string;
  winnerName?: string;
}

export interface ChallengeDoc {
  title: string;
  emoji: string;
  type: "progress" | "leaderboard" | "status";
  current_progress?: number;
  target?: number;
  unit?: string;
  participants: string[];
  status: "available" | "in_progress" | "completed";
  leaderboard?: { name: string; value: string; rank: number }[];
}

export interface GatheringDoc {
  title: string;
  host_name: string;
  host_id: string;
  description: string;
  date_time: string;
  max_spots: number;
  spots_left: number;
  attendees: string[];
  category: string;
  emoji: string;
  join_label?: string;
  is_secret?: boolean;
  secret_chance?: number;
  available_until?: string;
  hidden_location?: string;
}

export type NavTab = "home" | "quests" | "challenges" | "gatherings" | "profile";
