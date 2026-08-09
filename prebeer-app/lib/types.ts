export interface Gameweek {
  number: number;
  season: string;
  status: string;
  deadline: string;
  countdown: string;
  progress: number;
}

export interface MyWeek {
  submitted: boolean;
  correctPredictions: number;
  completedPredictions: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  currentRank: number | null;
  rankChange: number;
}

export interface LeagueLeaderStat {
  teamName: string;
  value: number;
}

export interface LeagueLeaders {
  points: LeagueLeaderStat | null;
  matchPredictions: LeagueLeaderStat | null;
  goalscorers: LeagueLeaderStat | null;
  assists: LeagueLeaderStat | null;
  cleanSheets: LeagueLeaderStat | null;
}

export interface ActivityItem {
  id: number;
  message: string;
  time: string;
}