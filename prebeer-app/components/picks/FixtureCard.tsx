"use client";

import Image from "next/image";

interface FixtureCardProps {
  fixture: any;
  selection: string | null;
  onSelect: (
    fixtureId: number,
    result: string
  ) => void;

  featuredMatchFixtureId?: number | null;
  gameOfTheWeekFixtureId?: number | null;

  locked?: boolean;
}

export default function FixtureCard({
  fixture,
  selection,
  onSelect,
  featuredMatchFixtureId,
  gameOfTheWeekFixtureId,
  locked = false,
}: FixtureCardProps) {

  const isFeatured =
    fixture.fixture_id === featuredMatchFixtureId;

  const isGameOfTheWeek =
    fixture.fixture_id === gameOfTheWeekFixtureId;

  const borderClass =
    isGameOfTheWeek
    ? "border-blue-500"
    : isFeatured
    ? "border-purple-500"
    : locked
    ? "border-amber-400"
    : "border-slate-800";

  const buttonStyle = (value: string) =>
  locked
    ? "border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed"
    : selection === value
    ? "bg-amber-400 text-slate-900 border-amber-400"
    : "border-slate-700 text-white hover:border-amber-400 hover:bg-slate-800";

  return (
    <div className={`rounded-3xl border bg-slate-900 p-5 ${borderClass}`}>

      {(isFeatured || isGameOfTheWeek) && (
        <div className="mb-4 flex justify-center">
          {isGameOfTheWeek ? (
            <span className="rounded-full bg-blue-600 px-4 py-1 text-sm font-bold text-white">
              🏆 MATCH OF THE WEEK
            </span>
          ) : (
            <span className="rounded-full bg-purple-600 px-4 py-1 text-sm font-bold text-white">
  ⭐ FEATURED MATCH
</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 items-center gap-3">

        <div className="flex flex-col items-center">
          <Image
            src={`https://resources.premierleague.com/premierleague/badges/70/t${fixture.clubs.badge_code}.png`}
            alt={fixture.clubs.club_name}
            width={48}
            height={48}
            style={{ height: "auto" }}
          />
          <p className="mt-2 text-center font-semibold">
            {fixture.clubs.club_name}
          </p>
        </div>

        <div className="text-center">

          <p className="text-sm text-slate-400">vs</p>

          <p className="mt-2 text-xs text-slate-500">
            {new Intl.DateTimeFormat("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/New_York",
            }).format(new Date(fixture.kickoff_time))}
          </p>

          {locked && (
  <p className="mt-2 text-sm font-semibold text-amber-400">
    🔒 Locked
  </p>
)}

        </div>

        <div className="flex flex-col items-center">
          <Image
            src={`https://resources.premierleague.com/premierleague/badges/70/t${fixture.away.badge_code}.png`}
            alt={fixture.away.club_name}
            width={48}
            height={48}
            style={{ height: "auto" }}
          />
          <p className="mt-2 text-center font-semibold">
            {fixture.away.club_name}
          </p>
        </div>

      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">

        <button
          disabled={locked}
          onClick={() => onSelect(fixture.fixture_id, "HOME")}
          className={`rounded-xl border py-3 font-semibold transition ${buttonStyle("HOME")}`}
        >
          {selection === "HOME" ? "✓ Home" : "Home"}
        </button>

        <button
          disabled={locked}
          onClick={() => onSelect(fixture.fixture_id, "DRAW")}
          className={`rounded-xl border py-3 font-semibold transition ${buttonStyle("DRAW")}`}
        >
          {selection === "DRAW" ? "✓ Draw" : "Draw"}
        </button>

        <button
          disabled={locked}
          onClick={() => onSelect(fixture.fixture_id, "AWAY")}
          className={`rounded-xl border py-3 font-semibold transition ${buttonStyle("AWAY")}`}
        >
          {selection === "AWAY" ? "✓ Away" : "Away"}
        </button>

      </div>

    </div>
  );
}