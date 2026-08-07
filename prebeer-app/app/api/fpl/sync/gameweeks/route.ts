import { NextResponse } from "next/server";
import { syncGameweeks } from "@/services/fpl/gameweeks";

export async function GET() {
  try {
    const result = await syncGameweeks();

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