import { NextResponse } from "next/server";
import { getMemberSelector } from "@/services/memberService";

export async function GET() {
  try {
    const members = await getMemberSelector();

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load members.",
      },
      {
        status: 500,
      }
    );
  }
}