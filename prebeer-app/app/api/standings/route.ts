import { NextResponse } from "next/server";
import { getSeasonStandings } from "@/services/standingsService";

export async function GET() {
  try {

    const standings =
      await getSeasonStandings();

    return NextResponse.json({
      success: true,
      standings,
    });

  } catch (error: any) {

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      message: error.message,
    },
    {
      status: 500,
    }
  );

}
}