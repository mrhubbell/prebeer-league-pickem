import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { processGameweek } from "@/services/fpl/processGameweek";

export async function GET(request: Request) {
  try {
    const syncSecret =
      process.env.FPL_SYNC_SECRET;

    const authorization =
      request.headers.get("authorization");

    if (
      !syncSecret ||
      authorization !== `Bearer ${syncSecret}`
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { data: matchweek, error } =
      await supabaseAdmin
        .from("matchweeks")
        .select(
          "matchweek_id, week_number, status"
        )
        .in("status", ["OPEN", "LOCKED"])
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
        message:
          "No open or completed Gameweek is available to sync.",
        gameweekId: null,
        dryRun: true,
      });
    }

    const result = await processGameweek(
      matchweek.matchweek_id,
      {
        dryRun: false,
      }
    );

    return NextResponse.json(result);

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