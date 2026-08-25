"use client";

import PlayerSearchSelect from "./PlayerSearchSelect";

interface Player {
  player_id: number;
  web_name: string;
  first_name: string;
  last_name: string;
  club_name: string;
  position: string;
}

interface BonusPicksCardProps {
  players: Player[];
  clubs: any[];

  goalPick1: number | null;
  goalPick2: number | null;

  assistPick1: number | null;
  assistPick2: number | null;

  cleanSheetClubId: number | null;

  onGoalPickChange: (
    pickNumber: number,
    playerId: number
  ) => void;

  onAssistPickChange: (
    pickNumber: number,
    playerId: number
  ) => void;

  onCleanSheetChange: (
    clubId: number
  ) => void;

  locked?: boolean;
}

export default function BonusPicksCard({
  players,
  clubs,
  goalPick1,
  goalPick2,
  assistPick1,
  assistPick2,
  cleanSheetClubId,
  onGoalPickChange,
  onAssistPickChange,
  onCleanSheetChange,
  locked,
}: BonusPicksCardProps) {
  return (
    <div
  className={`rounded-3xl border bg-slate-900 p-6 ${
    locked
      ? "border-amber-400"
      : "border-slate-800"
  }`}
>
{locked && (
  <div className="mb-6 rounded-xl border border-amber-400 bg-amber-400/10 px-4 py-3">
    <p className="font-semibold text-amber-400">
      🔒 WILDCARD PICKS ARE LOCKED!
    </p>

    <p className="mt-1 text-sm text-slate-400">
      Your picks lock after the first kickoff of the matchweek.
    </p>
  </div>
)}
      <h2 className="text-2xl font-bold text-white">
        ⭐ Wildcard Picks
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Get your picks in before the first match of the gameweek kicks off.
      </p>

      {/* GOALSCORERS */}

      <div className="mt-8">

        <h3 className="mb-4 text-lg font-semibold text-amber-400">
          ⚽ Goal Scorers
        </h3>

        <div className="space-y-4">

          <PlayerSearchSelect
            players={players}
            value={goalPick1}
            onChange={(playerId) =>
              onGoalPickChange(1, playerId)
            }
            placeholder="Goalscorer #1"
            disabled={locked}
            excludePlayerId={goalPick2}
            excludeGoalkeepers
          />

          <PlayerSearchSelect
            players={players}
            value={goalPick2}
            onChange={(playerId) =>
              onGoalPickChange(2, playerId)
            }
            placeholder="Goalscorer #2"
            disabled={locked}
            excludePlayerId={goalPick1}
            excludeGoalkeepers
          />

        </div>

      </div>

      {/* FUTURE BUILDS */}

      <div className="mt-10 border-t border-slate-800 pt-6">

  <h3 className="mb-4 text-lg font-semibold text-amber-400">
    🎯 Assists
  </h3>

  <div className="space-y-4">

    <PlayerSearchSelect
      players={players}
      value={assistPick1}
      onChange={(playerId) =>
        onAssistPickChange(1, playerId)
      }
      placeholder="Assister #1"
      disabled={locked}
      excludePlayerId={assistPick2}
    />

    <PlayerSearchSelect
      players={players}
      value={assistPick2}
      onChange={(playerId) =>
        onAssistPickChange(2, playerId)
      }
      placeholder="Assister #2"
      disabled={locked}
      excludePlayerId={assistPick1}
    />

</div>

</div>

<div className="mt-8 border-t border-slate-800 pt-6">

  <h3 className="mb-4 text-lg font-semibold text-amber-400">
    🧤 Clean Sheet
  </h3>

  <select
    value={cleanSheetClubId ?? ""}
    disabled={locked}
    onChange={(e) =>
      onCleanSheetChange(
        Number(e.target.value)
      )
    }
    className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
  >
    <option value="">
      Select Club
    </option>

    {clubs.map((club) => (
      <option
        key={club.club_id}
        value={club.club_id}
      >
        {club.club_name}
      </option>
    ))}
  </select>

</div>

</div>

);
}