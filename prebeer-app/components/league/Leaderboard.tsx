"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

interface Player {
  player_id: number;
  web_name: string;
  first_name: string;
  last_name: string;
  club_id: number;
  club_name: string;
  position: string;
}

interface Club {
  club_id: number;
  club_name: string;
}

interface GameweekPickData {
  gameweek: {
    weekNumber: number;
    matchweekId: number;
    status: string;
    fixtures: any[];
  };
  selections: Record<number, string>;
  goalScorers: {
    player_id: number;
    pick_number: number;
  }[];
  assists: {
    player_id: number;
    pick_number: number;
  }[];
  cleanSheet: {
    club_id: number;
  } | null;
}

export default function Leaderboard() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [resultsThroughMatchweek, setResultsThroughMatchweek] =
    useState<number>(0);

  const [loading, setLoading] = useState(true);

  const [expandedMember, setExpandedMember] =
    useState<number | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  const [selectedGameweek, setSelectedGameweek] =
    useState<number | null>(null);

  const [picks, setPicks] = useState<
    Record<number, GameweekPickData | null>
  >({});

  const [picksLoading, setPicksLoading] =
    useState(false);

  useEffect(() => {
    async function loadStandings() {
      try {
        const response = await fetch("/api/standings");
        const result = await response.json();

        if (response.ok && result.success) {
          setStandings(result.standings);
          setResultsThroughMatchweek(
            result.resultsThroughMatchweek
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadStandings();
  }, []);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const response = await fetch("/api/players");
        const result = await response.json();

        if (response.ok && result.success) {
          setPlayers(result.players);
        }
      } catch (error) {
        console.error(
          "Unable to load players:",
          error
        );
      }
    }

    loadPlayers();
  }, []);

  useEffect(() => {
    async function loadClubs() {
      try {
        const response = await fetch("/api/clubs");
        const result = await response.json();

        if (response.ok && result.success) {
          setClubs(result.clubs);
        }
      } catch (error) {
        console.error(
          "Unable to load clubs:",
          error
        );
      }
    }

    loadClubs();
  }, []);

  useEffect(() => {
    if (resultsThroughMatchweek > 0) {
      setSelectedGameweek(
        resultsThroughMatchweek
      );
    }
  }, [resultsThroughMatchweek]);

  async function loadMemberPicks(
    memberId: number,
    matchweekId: number
  ) {
    const cacheKey = `${memberId}-${matchweekId}`;

    if (picks[memberId] &&
        picks[memberId]?.gameweek.matchweekId === matchweekId) {
      return;
    }

    setPicksLoading(true);

    try {
      const response = await fetch(
        `/api/picks/member?memberId=${memberId}&matchweekId=${matchweekId}`
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setPicks((previous) => ({
          ...previous,
          [memberId]: result,
        }));
      }
    } catch (error) {
      console.error(
        "Unable to load member picks:",
        error
      );
    } finally {
      setPicksLoading(false);
    }
  }

  function handleExpand(memberId: number) {
    const isCurrentlyExpanded =
      expandedMember === memberId;

    if (isCurrentlyExpanded) {
      setExpandedMember(null);
      return;
    }

    setExpandedMember(memberId);

    if (selectedGameweek) {
      loadMemberPicks(
        memberId,
        selectedGameweek
      );
    }
  }

  function handleGameweekChange(
    memberId: number,
    matchweekId: number
  ) {
    setSelectedGameweek(matchweekId);

    loadMemberPicks(
      memberId,
      matchweekId
    );
  }

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

  function getMovementDisplay(
    rankChange: number
  ) {
    if (rankChange > 0) {
      return "👆";
    }

    if (rankChange < 0) {
      return "👇";
    }

    return "";
  }

  function getPlayerName(
    playerId: number
  ) {
    const player = players.find(
      (p) => p.player_id === playerId
    );

    if (!player) {
      return "Unknown Player";
    }

    return player.web_name;
  }

  function getClubName(
    clubId: number
  ) {
    const club = clubs.find(
      (c) => c.club_id === clubId
    );

    return club?.club_name ?? "Unknown Club";
  }

  function getPredictionLabel(
    prediction: string
  ) {
    switch (prediction) {
      case "HOME":
        return "Home Win";
      case "AWAY":
        return "Away Win";
      case "DRAW":
        return "Draw";
      default:
        return prediction;
    }
  }

  function getFixtureLabel(
    fixture: any
  ) {
    return `${fixture.clubs?.club_name ?? "Home"} vs ${
      fixture.away?.club_name ?? "Away"
    }`;
  }

  const activePicks =
    expandedMember !== null
      ? picks[expandedMember]
      : null;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-2 pt-1">
        <Link href="/" className="block">
          <Image
            src="/images/pre-beer-league-logo.png"
            alt="Pre-Beer League Pick 'Em"
            width={120}
            height={120}
            className="h-[120px] w-[120px] object-contain"
          />
        </Link>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            PRE-BEER LEAGUE
          </p>

          <h2 className="mt-1 text-2xl font-black leading-tight text-white sm:text-3xl">
            Standings
          </h2>

          {resultsThroughMatchweek > 0 && (
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Results through Matchweek{" "}
              {resultsThroughMatchweek}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-slate-400">
            Loading standings... 🍺
          </p>
        </div>
      ) : standings.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-slate-300">
            League standings will appear following the
            results of Gameweek 1. Sip your beer and calm
            down! 🍻
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem_1.5rem] items-center gap-2 border-b border-slate-800 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:grid-cols-[3rem_minmax(0,1fr)_5rem_1.5rem] sm:px-4">
            <span>#</span>
            <span>Team</span>
            <span className="text-right">Pts</span>
            <span />
          </div>

          {standings.map((member, index) => {
            const isExpanded =
              expandedMember === member.member_id;

            const memberPicks =
              isExpanded
                ? picks[member.member_id]
                : null;

            return (
              <div
                key={member.member_id}
                className="border-b border-slate-800 last:border-b-0"
              >
                <button
                  onClick={() =>
                    handleExpand(
                      member.member_id
                    )
                  }
                  className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-center gap-2 px-3 py-3 text-left transition hover:bg-slate-900 sm:grid-cols-[3rem_minmax(0,1fr)_1.5rem] sm:px-4"
                >
                  <span className="text-center text-lg font-bold text-slate-400 sm:text-xl">
                    {getRankDisplay(
                      index + 1
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight text-white sm:text-base">
                      {member.team_name}
                    </p>

                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-slate-400 sm:text-sm">
                        {member.first_name}{" "}
                        {member.last_name}
                      </p>

                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        {member.rank_change !==
                          0 && (
                          <span className="text-xs">
                            {getMovementDisplay(
                              member.rank_change
                            )}
                          </span>
                        )}

                        <span className="whitespace-nowrap text-sm font-bold text-amber-400 sm:text-base">
                          {member.season_points} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500">
                    {isExpanded
                      ? "▴"
                      : "▾"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-900/60 px-4 py-4 sm:px-6 sm:py-5">
                    <h3 className="mb-3 text-sm font-bold text-amber-400 sm:text-base">
                      🍻 Season Performance
                    </h3>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-300">
                          ⚽ Match Prediction Accuracy
                        </span>
                        <span className="font-semibold text-white">
                          {
                            member.match_prediction_accuracy
                          }%
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-300">
                          🥅 Goalscorer Accuracy
                        </span>
                        <span className="font-semibold text-white">
                          {
                            member.goalscorer_accuracy
                          }%
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-300">
                          🎯 Assist Accuracy
                        </span>
                        <span className="font-semibold text-white">
                          {
                            member.assist_accuracy
                          }%
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-300">
                          🧤 Clean Sheet Accuracy
                        </span>
                        <span className="font-semibold text-white">
                          {
                            member.clean_sheet_accuracy
                          }%
                        </span>
                      </div>
                    </div>

                    {resultsThroughMatchweek >
                      0 && (
                      <div className="mt-6 border-t border-slate-800 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-bold text-amber-400 sm:text-base">
                            📋 Gameweek Picks
                          </h3>

                          <select
                            value={
                              selectedGameweek ??
                              resultsThroughMatchweek
                            }
                            onChange={(event) =>
                              handleGameweekChange(
                                member.member_id,
                                Number(
                                  event.target.value
                                )
                              )
                            }
                            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-amber-400"
                          >
                            {Array.from(
                              {
                                length:
                                  resultsThroughMatchweek,
                              },
                              (_, index) => (
                                <option
                                  key={
                                    index + 1
                                  }
                                  value={
                                    index + 1
                                  }
                                >
                                  Gameweek{" "}
                                  {index + 1}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {picksLoading &&
                          !memberPicks && (
                            <div className="mt-4 rounded-xl bg-slate-950 p-4 text-center">
                              <p className="text-xs font-semibold text-slate-400">
                                Loading picks... 🍺
                              </p>
                            </div>
                          )}

                        {memberPicks && (
                          <div className="mt-4 space-y-5">
                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Match Predictions
                              </p>

                              <div className="space-y-1.5">
                                {memberPicks.gameweek.fixtures.map(
                                  (fixture) => {
                                    const prediction =
                                      memberPicks
                                        .selections[
                                        fixture.fixture_id
                                      ];

                                    return (
                                      <div
                                        key={
                                          fixture.fixture_id
                                        }
                                        className="flex items-center justify-between gap-3 rounded-lg bg-slate-950 px-3 py-2"
                                      >
                                        <span className="min-w-0 truncate text-xs text-slate-300">
                                          {getFixtureLabel(
                                            fixture
                                          )}
                                        </span>

                                        <span className="flex-shrink-0 text-xs font-bold text-white">
                                          {prediction
                                            ? getPredictionLabel(
                                                prediction
                                              )
                                            : "—"}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                🥅 Goalscorers
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {memberPicks.goalScorers.map(
                                  (pick) => (
                                    <span
                                      key={
                                        pick.pick_number
                                      }
                                      className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                                    >
                                      {getPlayerName(
                                        pick.player_id
                                      )}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                🎯 Assists
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {memberPicks.assists.map(
                                  (pick) => (
                                    <span
                                      key={
                                        pick.pick_number
                                      }
                                      className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                                    >
                                      {getPlayerName(
                                        pick.player_id
                                      )}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                🧤 Clean Sheet
                              </p>

                              <span className="inline-block rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                                {memberPicks.cleanSheet
                                  ? getClubName(
                                      memberPicks
                                        .cleanSheet
                                        .club_id
                                    )
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}