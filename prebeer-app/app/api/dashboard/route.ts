import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboardService";

export async function GET() {
  try {
    const stats = await getDashboardStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err,
      },
      { status: 500 }
    );
  }
}