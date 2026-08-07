import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getBootstrapStatic } from "./api";

export async function syncClubs() {
  const data = await getBootstrapStatic();

  const clubs = data.teams.map((team: any) => ({
    club_id: team.id,
    club_name: team.name,
    short_name: team.short_name,
    abbreviation: team.short_name,
    badge_code: team.code,
  }));

  const { data: result, error } = await supabaseAdmin
    .from("clubs")
    .upsert(clubs, {
      onConflict: "club_id",
    })
    .select();

  if (error) {
    throw error;
  }

  return {
    synced: result?.length ?? 0,
  };
}