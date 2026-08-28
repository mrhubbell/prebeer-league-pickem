import { NextResponse } from "next/server";

import {
  getGameweekPickStatus,
} from "@/services/picksService";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // Get the current OPEN Gameweek
    const {
      data: gameweek,
      error: gameweekError,
    } = await supabaseAdmin
      .from("matchweeks")
      .select(
        "matchweek_id, week_number, status"
      )
      .eq("status", "OPEN")
      .order("week_number", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (gameweekError) {
      throw gameweekError;
    }

    if (!gameweek) {
      return NextResponse.json({
        success: true,
        gameweek: null,
        members: [],
      });
    }

    const members =
      await getGameweekPickStatus(
        gameweek.matchweek_id
      );

    return NextResponse.json({
      success: true,
      gameweek: {
        matchweekId:
          gameweek.matchweek_id,
        weekNumber:
          gameweek.week_number,
        status:
          gameweek.status,
      },
      members,
    });
  } catch (error) {
    console.error(
      "PICK STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load pick status.",
      },
      {
        status: 500,
      }
    );
  }
}