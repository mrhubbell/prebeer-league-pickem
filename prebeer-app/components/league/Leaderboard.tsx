"use client";

import { useEffect, useState } from "react";

interface Standing {
  member_id: number;
  first_name: string;
  last_name: string;
  team_name: string;
  season_points: number;
  rank_change: number;
  match_prediction_accuracy: number;
  goalscorer_accuracy: number;
  assist_accuracy: number;
  clean_sheet_accuracy: number;
}

export default function Leaderboard() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMember, setExpandedMember] =
    useState<number | null>(null);

  useEffect(() => {
  async function loadStandings() {
    try {
      const response = await fetch("/api/standings");
      const result = await response.json();

      if (response.ok && result.success) {
        setStandings(result.standings);
      }
    } finally {
      setLoading(false);
    }
  }

  loadStandings();
}, []);

  function getRankDisplay(rank: number) {
    switch (rank) {
      case 1:
        return "🍻";
      case 2:
        return "🍺";
      case 3:
        return "🤝";
      default:
        return `${rank}.`;
    }
  }

  function getMovementDisplay(rankChange: number) {
    if (rankChange > 0) {
      return "👆";
    }

    if (rankChange < 0) {
      return "👇";
    }

    return "";
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-2xl font-bold text-white">
        Pre-Beer League Standings
      </h2>

      {loading ? (
  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 px-6 py-8 text-center">
    <p className="text-base font-semibold text-slate-400">
      Loading standings... 🍺
    </p>
  </div>
) : standings.length === 0 ? (
  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 px-6 py-8 text-center">
    <p className="text-base font-semibold text-slate-300">
      League standings will appear following the results of
      Gameweek 1. Sip your beer and calm down! 🍻
    </p>
  </div>
) : (
        <div className="mt-6 space-y-3">
          {standings.map((member, index) => (
            <div
              key={member.member_id}
              className="rounded-xl border border-slate-800"
            >
              <button
                onClick={() =>
                  setExpandedMember(
                    expandedMember === member.member_id
                      ? null
                      : member.member_id
                  )
                }
                className="flex w-full items-center justify-between p-4 text-left transition hover:bg-slate-800"
              >
                <div className="flex min-w-0 flex-1 items-center">
                  <span className="mr-4 w-10 flex-shrink-0 text-center text-2xl">
                    {getRankDisplay(index + 1)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="pr-2 text-base font-bold leading-tight text-white sm:text-lg">
                      {member.team_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {member.first_name} {member.last_name}
                    </p>
                  </div>
                </div>

                <div className="ml-3 flex flex-shrink-0 items-end gap-3 sm:ml-4">
                  {member.rank_change !== 0 && (
                    <span className="text-sm">
                      {getMovementDisplay(member.rank_change)}
                    </span>
                  )}

                  <div className="w-16 whitespace-nowrap text-right text-base font-bold text-amber-400">
                    {member.season_points} pts
                  </div>

                  <span className="text-sm text-slate-500">
                    {expandedMember === member.member_id
                      ? "▴"
                      : "▾"}
                  </span>
                </div>
              </button>

              {expandedMember === member.member_id && (
                <div className="border-t border-slate-800 bg-slate-950 px-6 py-5">
                  <h3 className="mb-4 text-lg font-bold text-amber-400">
                    🍻 Season Performance
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
  <span>⚽ Match Prediction Accuracy</span>
  <span>{member.match_prediction_accuracy}%</span>
</div>

<div className="flex justify-between">
  <span>🥅 Goalscorer Accuracy</span>
  <span>{member.goalscorer_accuracy}%</span>
</div>

<div className="flex justify-between">
  <span>🎯 Assist Accuracy</span>
  <span>{member.assist_accuracy}%</span>
</div>

<div className="flex justify-between">
  <span>🧤 Clean Sheet Accuracy</span>
  <span>{member.clean_sheet_accuracy}%</span>
</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}