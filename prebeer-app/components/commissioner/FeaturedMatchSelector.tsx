"use client";

import { useState } from "react";

interface Fixture {
  fixture_id: number;
  kickoff_time: string;
  clubs: any;
  away: any;
}

interface Props {
  matchweekId: number;
  fixtures: Fixture[];
  initialFeaturedMatch: number | null;
  initialGameOfWeek: number | null;
}

export default function FeaturedMatchSelector({
  matchweekId,
  fixtures,
  initialFeaturedMatch,
  initialGameOfWeek,
}: Props) {
  const [featuredMatch, setFeaturedMatch] = useState<number | null>(
    initialFeaturedMatch
  );
  const [gameOfWeek, setGameOfWeek] = useState<number | null>(
    initialGameOfWeek
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function selectFeatured(fixtureId: number) {
    if (gameOfWeek === fixtureId) setGameOfWeek(null);
    setFeaturedMatch(fixtureId);
  }

  function selectGameOfWeek(fixtureId: number) {
    if (featuredMatch === fixtureId) setFeaturedMatch(null);
    setGameOfWeek(fixtureId);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/commissioner/featured-matches/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matchweekId,
            featuredMatchFixtureId: featuredMatch,
            gameOfTheWeekFixtureId: gameOfWeek,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to save.");
      }

      setMessage("✅ Featured Matches Saved!");
    } catch (err: any) {
      setMessage(err.message ?? "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="grid grid-cols-[1fr_180px_200px] gap-4 border-b border-slate-700 bg-slate-800 px-6 py-4 font-bold">
        <div>Fixture</div>
        <div className="text-center">⭐ Featured Match</div>
        <div className="text-center">🏆 Game of the Week</div>
      </div>

      {fixtures.map((fixture) => {
        const isFeatured = featuredMatch === fixture.fixture_id;
        const isGameOfWeek = gameOfWeek === fixture.fixture_id;

        return (
          <div
            key={fixture.fixture_id}
            className="grid grid-cols-[1fr_180px_200px] items-center gap-4 border-b border-slate-800 px-6 py-4 last:border-0"
          >
            <div>
              <p className="font-semibold">
                {(fixture.clubs as any).club_name} {" vs "} {(fixture.away as any).club_name}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/New_York",
                }).format(new Date(fixture.kickoff_time))}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => selectFeatured(fixture.fixture_id)}
                className={`w-40 rounded-lg px-3 py-2 font-semibold transition ${
                  isFeatured
                    ? "bg-amber-400 text-slate-900"
                    : "border border-slate-700 hover:border-amber-400"
                }`}
              >
                {isFeatured ? "⭐ Selected" : "Select"}
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => selectGameOfWeek(fixture.fixture_id)}
                className={`w-44 rounded-lg px-3 py-2 font-semibold transition ${
                  isGameOfWeek
                    ? "bg-blue-600 text-white"
                    : "border border-slate-700 hover:border-blue-500"
                }`}
              >
                {isGameOfWeek ? "🏆 Selected" : "Select"}
              </button>
            </div>
          </div>
        );
      })}

      <div className="border-t border-slate-700 p-6 space-y-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-amber-400 py-4 text-lg font-bold text-slate-900 transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Featured Matches"}
        </button>

        {message && (
          <div className="rounded-lg bg-slate-800 p-3 text-center text-amber-300">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}