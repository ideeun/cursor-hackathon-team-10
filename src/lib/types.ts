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
  level: number;
  xp: number;
  avatar_url?: string;
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

export type NavTab = "home" | "challenges" | "gatherings" | "profile";
