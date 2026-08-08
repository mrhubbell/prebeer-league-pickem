import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface AssistPick {
  player_id: number;
  pick_number: number;
}

export async function getAssistPicks(
  memberId: number,
  matchweekId: number
) {
  const { data, error } = await supabaseAdmin
    .from("assists_picks")
    .select("player_id, pick_number")
    .eq("member_id", memberId)
    .eq("matchweek_id", matchweekId)
    .order("pick_number");

  if (error) throw error;

  return data;
}

export async function saveAssistPicks(
  memberId: number,
  matchweekId: number,
  picks: AssistPick[]
) {

  if (picks.length !== 2) {
    throw new Error(
      "Exactly two assisters must be selected."
    );
  }

  if (
    picks[0].player_id ===
    picks[1].player_id
  ) {
    throw new Error(
      "Assist picks must be unique."
    );
  }

  const rows = picks.map((pick) => ({
    member_id: memberId,
    matchweek_id: matchweekId,
    player_id: pick.player_id,
    pick_number: pick.pick_number,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin
    .from("assists_picks")
    .upsert(rows, {
      onConflict:
        "member_id,matchweek_id,pick_number",
    });

  if (error) throw error;

  return {
    success: true,
  };
}