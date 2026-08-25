import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSeasonStandings } from "@/services/standingsService";

export async function GET() {
  try {
    const [standings, matchweekResult] =
      await Promise.all([
        getSeasonStandings(),

        supabaseAdmin
          .from("matchweeks")
          .select("week_number")
          .eq("status", "LOCKED")
          .order("week_number", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle(),
      ]);

    if (matchweekResult.error) {
      throw matchweekResult.error;
    }

    return NextResponse.json({
      success: true,
      standings,
      resultsThroughMatchweek:
        matchweekResult.data?.week_number ?? 0,
    });

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}