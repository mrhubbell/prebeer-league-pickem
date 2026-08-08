import { NextResponse } from "next/server";
import { getPlayers } from "@/services/playerService";

export async function GET() {
  try {
    const players = await getPlayers();

    return NextResponse.json({
      success: true,
      players,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load players.",
      },
      {
        status: 500,
      }
    );
  }
}