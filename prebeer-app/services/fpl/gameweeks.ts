import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getBootstrapStatic } from "./api";

export async function syncGameweeks() {
  const data = await getBootstrapStatic();

  const gameweeks = data.events.map((event: any) => ({
    matchweek_id: event.id,
    season_id: 1, // We'll make this dynamic later
    week_number: event.id,
    deadline: event.deadline_time,

    status: event.finished
  ? "LOCKED"
  : event.is_current
  ? "OPEN"
  : "UPCOMING",

    fixture_count: 0, // Updated later when fixtures are synced
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