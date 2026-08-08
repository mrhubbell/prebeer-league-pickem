import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("matchweeks")
      .select(`
        matchweek_id,
        week_number,
        featured_match_fixture_id,
        game_of_the_week_fixture_id
      `)
      .eq("status", "UPCOMING")
      .order("week_number")
      .limit(1)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      matchweekId: data.matchweek_id,
      weekNumber: data.week_number,
      featuredMatchFixtureId:
        data.featured_match_fixture_id,
      gameOfTheWeekFixtureId:
        data.game_of_the_week_fixture_id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load current matchweek.",
      },
      {
        status: 500,
      }
    );
  }
}