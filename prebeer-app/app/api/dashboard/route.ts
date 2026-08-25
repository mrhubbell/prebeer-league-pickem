import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getDashboardData } from "@/services/dashboardService";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to view your dashboard.",
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
          message: "Your login session is invalid or expired.",
        },
        { status: 401 }
      );
    }

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
        { status: 403 }
      );
    }

    const dashboardStart = Date.now();

const dashboard = await getDashboardData(
  member.member_id
);

console.log(
  `Dashboard data loaded in ${Date.now() - dashboardStart}ms`
);

return NextResponse.json({
  success: true,
  dashboard,
});

    return NextResponse.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard.",
      },
      { status: 500 }
    );
  }
}