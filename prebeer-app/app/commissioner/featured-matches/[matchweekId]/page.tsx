import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import FeaturedMatchSelector from "@/components/commissioner/FeaturedMatchSelector";

interface Props {
  params: Promise<{
    matchweekId: string;
  }>;
}

export default async function GameweekPage({
  params,
}: Props) {
  const { matchweekId } = await params;

  const { data: matchweek, error: matchweekError } =
    await supabaseAdmin
      .from("matchweeks")
      .select(`
        week_number,
        featured_match_fixture_id,
        game_of_the_week_fixture_id
      `)
      .eq("matchweek_id", matchweekId)
      .single();

  if (matchweekError) throw matchweekError;

  const { data: fixtures, error: fixtureError } =
    await supabaseAdmin
      .from("fixtures")
      .select(`
        fixture_id,
        kickoff_time,
        clubs!fixtures_home_club_id_fkey (
          club_name
        ),
        away:clubs!fixtures_away_club_id_fkey (
          club_name
        )
      `)
      .eq("matchweek_id", matchweekId)
      .order("kickoff_time");

  if (fixtureError) throw fixtureError;

  return (
    <main className="mx-auto max-w-6xl p-8">

      <Link
        href="/commissioner/featured-matches"
        className="text-amber-400 hover:underline"
      >
        ← Back to Featured Matches
      </Link>

      <h1 className="mt-6 text-4xl font-black">
        Gameweek {matchweek.week_number}
      </h1>

      <p className="mt-2 text-slate-400">
        Select one Featured Match and one Game of the Week.
      </p>

      <div className="mt-8">
        <FeaturedMatchSelector
          matchweekId={Number(matchweekId)}
          fixtures={fixtures}
          initialFeaturedMatch={
            matchweek.featured_match_fixture_id
          }
          initialGameOfWeek={
            matchweek.game_of_the_week_fixture_id
          }
        />
      </div>

    </main>
  );
}