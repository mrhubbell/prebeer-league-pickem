import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import PageContainer from "@/components/layout/PageContainer";
import BottomNavigation from "@/components/navigation/BottomNavigation";

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
    <PageContainer>
      <div className="space-y-5 pb-24">
        <Link
          href="/admin"
          className="text-amber-400 hover:underline"
        >
          ← Back to Admin
        </Link>

        <div>
          <h1 className="mt-4 text-4xl font-black">
            Featured Matches
          </h1>

          <p className="mt-2 text-slate-400">
            Choose the Featured Match and the Game of the Week
            for each gameweek.
          </p>
        </div>

        <div className="grid gap-4">
          {matchweeks.map((week) => {
            const isComplete =
              !!week.featured_match_fixture_id &&
              !!week.game_of_the_week_fixture_id;

            return (
              <Link
                key={week.matchweek_id}
                href={`/admin/featured-matches/${week.matchweek_id}`}
                className={`block rounded-2xl border p-5 transition ${
                  isComplete
                    ? "border-amber-400/60 bg-amber-400/5 hover:border-amber-400"
                    : "border-slate-800 bg-slate-900 hover:border-amber-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between pr-4">
                      <h2 className="text-xl font-bold">
                        Gameweek {week.week_number}
                      </h2>

                      {isComplete ? (
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          ✓ Complete
                        </span>
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          ⚠ Needs Setup
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-3 text-sm ${
                        week.featured_match_fixture_id
                          ? "text-amber-300"
                          : "text-slate-500"
                      }`}
                    >
                      {week.featured_match_fixture_id
                        ? "⭐ Featured Match Selected"
                        : "⭐ Featured Match Not Selected"}
                    </p>

                    <p
                      className={`text-sm ${
                        week.game_of_the_week_fixture_id
                          ? "text-blue-300"
                          : "text-slate-500"
                      }`}
                    >
                      {week.game_of_the_week_fixture_id
                        ? "⭐⭐⭐ Game of the Week Selected"
                        : "⭐⭐⭐ Game of the Week Not Selected"}
                    </p>
                  </div>

                  <div className="ml-4 text-3xl">
                    →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNavigation />
    </PageContainer>
  );
}