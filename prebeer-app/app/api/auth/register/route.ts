import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const LEAGUE_CODE = "PREBEER26";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      leagueCode,
      firstName,
      lastName,
      teamName,
      email,
      password,
    } = body;

    if (
      !leagueCode ||
      !firstName ||
      !lastName ||
      !teamName ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all fields.",
        },
        { status: 400 }
      );
    }

    if (leagueCode.trim().toUpperCase() !== LEAGUE_CODE) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid league code.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    /*
     * First check whether this email already belongs
     * to an existing league member.
     */
    const { data: existingMember, error: memberLookupError } =
      await supabaseAdmin
        .from("members")
        .select("member_id, profile_id")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (memberLookupError) {
      throw memberLookupError;
    }

    if (existingMember?.profile_id) {
      return NextResponse.json(
        {
          success: false,
          message: "An account already exists for this league member.",
        },
        { status: 400 }
      );
    }

    /*
     * Create the Supabase Auth user.
     */
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          message: authError.message,
        },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    /*
     * Create the profile.
     */
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        display_name: `${firstName.trim()} ${lastName.trim()}`,
        is_commissioner: false,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileError;
    }

    /*
     * If this email already belongs to a league member,
     * connect the new profile to that member.
     */
    if (existingMember) {
      const { error: updateMemberError } = await supabaseAdmin
        .from("members")
        .update({
          profile_id: userId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: `${firstName.trim()} ${lastName.trim()}`,
          team_name: teamName.trim(),
          active: true,
        })
        .eq("member_id", existingMember.member_id);

      if (updateMemberError) {
        await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("id", userId);

        await supabaseAdmin.auth.admin.deleteUser(userId);

        throw updateMemberError;
      }
    } else {
      /*
       * This is a brand-new league member.
       */
      const { error: newMemberError } = await supabaseAdmin
        .from("members")
        .insert({
          profile_id: userId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: `${firstName.trim()} ${lastName.trim()}`,
          email: normalizedEmail,
          team_name: teamName.trim(),
          active: true,
          joined_date: new Date().toISOString().split("T")[0],
        });

      if (newMemberError) {
        await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("id", userId);

        await supabaseAdmin.auth.admin.deleteUser(userId);

        throw newMemberError;
      }
    }

    return NextResponse.json({
      success: true,
      message: "League account created successfully!",
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Unable to create league account.",
      },
      { status: 500 }
    );
  }
}