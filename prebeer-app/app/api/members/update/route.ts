import { NextResponse } from "next/server";
import { updateMember } from "@/services/memberService";

export async function POST(request: Request) {
  try {
    const member = await request.json();

    const result = await updateMember(member);

    return NextResponse.json({
      success: true,
      member: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update member.",
      },
      {
        status: 500,
      }
    );
  }
}