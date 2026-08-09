import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
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
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    const { data: member, error: memberError } =
      await supabaseAdmin
        .from("members")
        .select(`
          member_id,
          first_name,
          last_name,
          display_name,
          team_name,
          email,
          active,
          role
        `)
        .eq("profile_id", user.id)
        .maybeSingle();

    if (memberError) {
      throw memberError;
    }

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "No league member is associated with this account.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      member,
    });
  } catch (error: any) {
    console.error("Auth/me error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to identify member.",
      },
      { status: 500 }
    );
  }
}