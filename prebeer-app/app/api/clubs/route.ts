import { NextResponse } from "next/server";
import { getClubs } from "@/services/clubService";

export async function GET() {

  try {

    const clubs =
      await getClubs();

    return NextResponse.json({
      success: true,
      clubs,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load clubs.",
      },
      {
        status: 500,
      }
    );

  }

}