import { NextResponse } from "next/server";

import { syncSeasons } from "@/services/fpl/seasons";
import { syncClubs } from "@/services/fpl/clubs";
import { syncPlayers } from "@/services/fpl/players";
import { syncGameweeks } from "@/services/fpl/gameweeks";
import { syncFixtures } from "@/services/fpl/fixtures";

export async function GET() {
  try {
    const seasons = await syncSeasons();
    const clubs = await syncClubs();
    const players = await syncPlayers();
    const gameweeks = await syncGameweeks();
    const fixtures = await syncFixtures();

    return NextResponse.json({
      success: true,
      seasons,
      clubs,
      players,
      gameweeks,
      fixtures,
    });
  } catch (err) {
    console.error("ADMIN SYNC ERROR:", err);

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