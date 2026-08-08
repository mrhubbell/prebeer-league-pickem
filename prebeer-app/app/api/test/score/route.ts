import { NextResponse } from "next/server";
import { scoreGameweek } from "@/services/scoreGameweekService";

export async function GET() {
  try {
    const result = await scoreGameweek(1);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to score gameweek.",
      },
      {
        status: 500,
      }
    );
  }
}