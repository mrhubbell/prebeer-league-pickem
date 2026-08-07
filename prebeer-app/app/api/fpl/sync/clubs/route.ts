import { NextResponse } from "next/server";
import { syncClubs } from "@/services/fpl/clubs";

export async function GET() {
  try {
    const result = await syncClubs();

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