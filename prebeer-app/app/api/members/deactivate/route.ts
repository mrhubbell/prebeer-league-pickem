import { NextResponse } from "next/server";
import { deactivateMember } from "@/services/memberService";

export async function POST(request: Request) {
  try {
    const { member_id } = await request.json();

    const result = await deactivateMember(member_id);

    return NextResponse.json({
      success: true,
      member: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to deactivate member.",
      },
      {
        status: 500,
      }
    );
  }
}