import { NextResponse } from "next/server";
import { getBootstrapData } from "@/services/fplApi";

export async function GET() {
  try {
    const data = await getBootstrapData();

    return NextResponse.json({
      success: true,
      players: data.elements.length,
      clubs: data.teams.length,
      gameweeks: data.events.length,
      positions: data.element_types.length,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}