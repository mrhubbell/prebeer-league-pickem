"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FeaturedMatchSelector({
  matchweekId,
  fixtures,
  initialFeaturedMatch,
  initialGameOfWeek,
}: Props) {
  const [featuredMatch, setFeaturedMatch] =
    useState<number | null>(initialFeaturedMatch);

  const [gameOfWeek, setGameOfWeek] =
    useState<number | null>(initialGameOfWeek);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function selectFeatured(fixtureId: number) {
    if (gameOfWeek === fixtureId) {
      setGameOfWeek(null);
    }

    setFeaturedMatch(fixtureId);
  }

  function selectGameOfWeek(fixtureId: number) {
    if (featuredMatch === fixtureId) {
      setFeaturedMatch(null);
    }

    setGameOfWeek(fixtureId);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Not authenticated.");
      }

      const response = await fetch(
        "/api/admin/featured-matches/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
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
        throw new Error(
          result.message ?? "Unable to save."
        );
      }

      setMessage("✅ Featured Matches Saved!");
    } catch (err: any) {
      setMessage(
        err.message ?? "Unable to save."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

      {/* Header */}
      <div className="border-b border-slate-700 px-5 py-4">
        <p className="text-sm font-bold text-slate-300">
          Select Featured Matches
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Select one Featured Match and one Game of the Week.
        </p>
      </div>

      {/* Fixtures */}
      {fixtures.map((fixture) => {
        const isFeatured =
          featuredMatch === fixture.fixture_id;

        const isGameOfWeek =
          gameOfWeek === fixture.fixture_id;

        return (
          <div
            key={fixture.fixture_id}
            className={`border-b border-slate-800 p-5 last:border-0 ${
              isFeatured
                ? "bg-amber-400/5 ring-1 ring-inset ring-amber-400"
                : isGameOfWeek
                ? "bg-blue-500/5 ring-1 ring-inset ring-blue-500"
                : ""
            }`}
          >

            {/* Fixture */}
            <div>
              <p className="text-base font-bold text-white">
                {(fixture.clubs as any).club_name}
                {" vs "}
                {(fixture.away as any).club_name}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {new Intl.DateTimeFormat(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/New_York",
                  }
                ).format(
                  new Date(fixture.kickoff_time)
                )}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-4 grid gap-2">

              <button
                type="button"
                onClick={() =>
                  selectFeatured(
                    fixture.fixture_id
                  )
                }
                className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isFeatured
                    ? "bg-amber-400 text-slate-900"
                    : "border border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-300"
                }`}
              >
                {isFeatured
                  ? "⭐ Featured Match Selected"
                  : "⭐ Select Featured Match"}
              </button>

              <button
                type="button"
                onClick={() =>
                  selectGameOfWeek(
                    fixture.fixture_id
                  )
                }
                className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isGameOfWeek
                    ? "bg-blue-600 text-white"
                    : "border border-slate-700 text-slate-300 hover:border-blue-500 hover:text-blue-300"
                }`}
              >
                {isGameOfWeek
                  ? "🏆 Game of the Week Selected"
                  : "🏆 Select Game of the Week"}
              </button>

            </div>
          </div>
        );
      })}

      {/* Save */}
      <div className="space-y-4 border-t border-slate-700 p-5">

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-amber-400 py-4 text-lg font-bold text-slate-900 transition hover:brightness-110 disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : "Save Featured Matches"}
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