"use client";

interface Player {
  player_id: number;
  web_name: string;
}

interface GoalScorerCardProps {
  players: Player[];
  pick1: number | null;
  pick2: number | null;
  onChange: (pickNumber: number, playerId: number) => void;
  locked?: boolean;
}

export default function GoalScorerCard({
  players,
  pick1,
  pick2,
  onChange,
  locked = false,
}: GoalScorerCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">

      <h2 className="text-xl font-bold text-white">
        ⚽ Goalscorer Picks
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Pick two unique players.
      </p>

      <div className="mt-5 space-y-4">

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Goalscorer #1
          </label>

          <select
            value={pick1 ?? ""}
            disabled={locked}
            onChange={(e) =>
              onChange(1, Number(e.target.value))
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
          >
            <option value="">
              Select Player
            </option>

            {players.map((player) => (
              <option
                key={player.player_id}
                value={player.player_id}
                disabled={player.player_id === pick2}
              >
                {player.web_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Goalscorer #2
          </label>

          <select
            value={pick2 ?? ""}
            disabled={locked}
            onChange={(e) =>
              onChange(2, Number(e.target.value))
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
          >
            <option value="">
              Select Player
            </option>

            {players.map((player) => (
              <option
                key={player.player_id}
                value={player.player_id}
                disabled={player.player_id === pick1}
              >
                {player.web_name}
              </option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
}