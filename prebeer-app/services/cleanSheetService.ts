import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface CleanSheetPick {
  club_id: number;
}

export async function getCleanSheetPick(
  memberId: number,
  matchweekId: number
) {
  const { data, error } = await supabaseAdmin
    .from("clean_sheet_picks")
    .select("club_id")
    .eq("member_id", memberId)
    .eq("matchweek_id", matchweekId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
}

export async function saveCleanSheetPick(
  memberId: number,
  matchweekId: number,
  pick: CleanSheetPick
) {

  const row = {
    member_id: memberId,
    matchweek_id: matchweekId,
    club_id: pick.club_id,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("clean_sheet_picks")
    .upsert(row, {
      onConflict: "member_id,matchweek_id",
    });

  if (error) throw error;

  return {
    success: true,
  };
}