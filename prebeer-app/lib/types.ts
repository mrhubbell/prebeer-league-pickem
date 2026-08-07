export interface Gameweek {
  number: number;
  season: string;
  status: string;
  deadline: string;
  countdown: string;
  progress: number;
}

export interface MyWeek {
  picksComplete: number;
  totalMatches: number;
  doublePoints: string | null;
  triplePoints: string | null;
  submitted: boolean;
}

export interface LeagueLeader {
  name: string;
  points: number;
  weeklyGain: number;
}

export interface ActivityItem {
  id: number;
  message: string;
  time: string;
}