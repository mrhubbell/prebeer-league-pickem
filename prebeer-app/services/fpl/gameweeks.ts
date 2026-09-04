import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getBootstrapStatic } from "./api";

export async function syncGameweeks() {
  const data = await getBootstrapStatic();

  const gameweeks = data.events.map((event: any) => ({
    matchweek_id: event.id,
    season_id: 1,
    week_number: event.id,
    deadline: event.deadline_time,
    fixture_count: 0,
  }));

  const { data: result, error } = await supabaseAdmin
    .from("matchweeks")
    .upsert(gameweeks, {
      onConflict: "matchweek_id",
    })
    .select();

  if (error) {
    throw error;
  }

  return {
    synced: result?.length ?? 0,
  };
}