import { NextResponse } from "next/server";
import { syncSeasons } from "@/services/fpl/seasons";

export async function GET() {
  try {
    const result = await syncSeasons();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("SYNC ERROR:", err);

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