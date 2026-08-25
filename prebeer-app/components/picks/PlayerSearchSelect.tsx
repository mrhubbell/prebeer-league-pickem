"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Player {
  player_id: number;
  web_name: string;
  first_name: string;
  last_name: string;
  club_name: string;
  position: string;
}

interface PlayerSearchSelectProps {
  players: Player[];
  value: number | null;
  onChange: (playerId: number) => void;
  placeholder: string;
  disabled?: boolean;
  excludePlayerId?: number | null;
  excludeGoalkeepers?: boolean;
}

export default function PlayerSearchSelect({
  players,
  value,
  onChange,
  placeholder,
  disabled = false,
  excludePlayerId = null,
  excludeGoalkeepers = false,
}: PlayerSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPlayer =
    players.find(
      (player) => player.player_id === value
    ) ?? null;

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return players
      .filter((player) => {
        if (
          excludeGoalkeepers &&
          player.position === "GK"
        ) {
          return false;
        }

        if (
          excludePlayerId !== null &&
          player.player_id === excludePlayerId
        ) {
          return false;
        }

        if (!term) {
          return true;
        }

        return (
          player.web_name
            .toLowerCase()
            .includes(term) ||
          player.first_name
            .toLowerCase()
            .includes(term) ||
          player.last_name
            .toLowerCase()
            .includes(term) ||
          player.club_name
            .toLowerCase()
            .includes(term)
        );
      })
      .slice(0, 20);
  }, [
    players,
    search,
    excludePlayerId,
    excludeGoalkeepers,
  ]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function handleSelect(playerId: number) {
    onChange(playerId);
    setSearch("");
    setOpen(false);
  }

  function handleClear() {
    onChange(0);
    setSearch("");
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-left text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {selectedPlayer ? (
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate">
              {selectedPlayer.club_name} •{" "}
              {selectedPlayer.web_name} •{" "}
              {selectedPlayer.position}
            </span>

            {!disabled && (
              <span className="flex-shrink-0 text-slate-400">
                ✕
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400">
            {placeholder}
          </span>
        )}
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search player or club..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
          />

          <div className="mt-2 max-h-64 overflow-y-auto">
            {selectedPlayer && (
              <button
                type="button"
                onClick={handleClear}
                className="mb-1 w-full rounded-lg px-3 py-2 text-left text-sm text-amber-400 hover:bg-slate-800"
              >
                ✕ Clear selection
              </button>
            )}

            {filteredPlayers.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">
                No players found.
              </p>
            ) : (
              filteredPlayers.map((player) => (
                <button
                  key={player.player_id}
                  type="button"
                  onClick={() =>
                    handleSelect(
                      player.player_id
                    )
                  }
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-slate-800"
                >
                  <span className="font-semibold">
                    {player.club_name}
                  </span>
                  {" • "}
                  {player.web_name}
                  {" • "}
                  <span className="text-slate-400">
                    {player.position}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
