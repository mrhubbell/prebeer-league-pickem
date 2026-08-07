import { NextResponse } from "next/server";
import { syncPlayers } from "@/services/fpl/players";

export async function GET() {
  try {
    const result = await syncPlayers();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("SYNC ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err,
      },
      { status: 500 }
    );
  }
}