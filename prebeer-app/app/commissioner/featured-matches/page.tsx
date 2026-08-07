import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function FeaturedMatchesPage() {
  const { data: matchweeks, error } = await supabaseAdmin
    .from("matchweeks")
    .select(
      "matchweek_id, week_number, featured_match_fixture_id, game_of_the_week_fixture_id"
    )
    .order("week_number");

  if (error) {
    throw error;
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8">
        <Link
          href="/commissioner"
          className="text-amber-400 hover:underline"
        >
          ← Back to Commissioner
        </Link>

        <h1 className="mt-4 text-4xl font-black">
          Featured Matches
        </h1>

        <p className="mt-2 text-slate-400">
          Choose the Featured Match and the Game of the Week for each gameweek.
        </p>
      </div>

      <div className="grid gap-4">
        {matchweeks.map((week) => (
          <Link
            key={week.matchweek_id}
            href={`/commissioner/featured-matches/${week.matchweek_id}`}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-amber-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Gameweek {week.week_number}
                </h2>

                <p className="mt-3 text-sm">
                  {week.featured_match_fixture_id
                    ? "⭐ Featured Match Selected"
                    : "⭐ Featured Match Not Selected"}
                </p>

                <p className="text-sm">
                  {week.game_of_the_week_fixture_id
                    ? "⭐⭐⭐ Game of the Week Selected"
                    : "⭐⭐⭐ Game of the Week Not Selected"}
                </p>
              </div>

              <div className="text-3xl">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}