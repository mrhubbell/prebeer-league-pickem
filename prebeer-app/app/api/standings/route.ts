import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLiveSeasonStandings } from "@/services/standingsService";

export async function GET() {
  try {
    // Find the currently active gameweek.
    const { data: matchweek, error } =
      await supabaseAdmin
        .from("matchweeks")
        .select("matchweek_id, week_number, status")
        .eq("status", "OPEN")
        .order("week_number", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!matchweek) {
      return NextResponse.json({
        success: true,
        standings: [],
        gameweek: null,
      });
    }

    // Calculate standings using completed results
    // from the current gameweek plus all prior
    // completed gameweeks.
    const standings =
      await getLiveSeasonStandings(
        matchweek.matchweek_id
      );

    return NextResponse.json({
      success: true,
      standings,
      gameweek: {
        matchweekId:
          matchweek.matchweek_id,
        weekNumber:
          matchweek.week_number,
        status:
          matchweek.status,
      },
    });
  } catch (error: any) {
    console.error(
      "STANDINGS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ??
          "Unable to load standings.",
      },
      {
        status: 500,
      }
    );
  }
}