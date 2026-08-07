import { NextResponse } from "next/server";
import { createMember } from "@/services/memberService";

export async function POST(request: Request) {
  try {
    const member = await request.json();

    const result = await createMember(member);

    return NextResponse.json({
      success: true,
      member: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create member.",
      },
      {
        status: 500,
      }
    );
  }
}