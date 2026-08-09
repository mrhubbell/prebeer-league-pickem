import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { saveMemberPicks } from "@/services/picksService";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to save picks.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Your login session is invalid or expired.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Find the league member connected to
     * the authenticated Supabase user.
     */
    const { data: member, error: memberError } =
      await supabaseAdmin
        .from("members")
        .select("member_id")
        .eq("profile_id", user.id)
        .maybeSingle();

    if (memberError) {
      throw memberError;
    }

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No league member is associated with this account.",
        },
        {
          status: 403,
        }
      );
    }

    const { selections } = await request.json();

    if (!selections) {
      return NextResponse.json(
        {
          success: false,
          message: "No picks were provided.",
        },
        {
          status: 400,
        }
      );
    }

    const picks = Object.entries(
      selections as Record<number, string>
    ).map(([fixtureId, predictedResult]) => ({
      fixture_id: Number(fixtureId),
      predicted_result: predictedResult,
    }));

    const result = await saveMemberPicks(
      member.member_id,
      picks
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save picks.",
      },
      {
        status: 500,
      }
    );
  }
}