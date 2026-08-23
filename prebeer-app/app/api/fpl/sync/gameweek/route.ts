import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { syncGameweekPerformance } from "@/services/fpl/gameweekPerformanceSync";

export async function GET() {
  try {
    const { data: matchweek, error } =
      await supabaseAdmin
        .from("matchweeks")
        .select("matchweek_id, week_number")
        .eq("status", "LOCKED")
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
        message: "No completed Gameweek is available to sync.",
        gameweekId: null,
        dryRun: true,
      });
    }

    const result =
      await syncGameweekPerformance(
        matchweek.matchweek_id,
        { dryRun: true }
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error(
      "GAMEWEEK SYNC ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? {
                message: err.message,
                stack: err.stack,
              }
            : err,
      },
      { status: 500 }
    );
  }
}