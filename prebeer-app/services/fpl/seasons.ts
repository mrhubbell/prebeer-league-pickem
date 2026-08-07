import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getBootstrapStatic } from "./api";

export async function syncSeasons() {
  const data = await getBootstrapStatic();

  // Example: "2026/27"
  const seasonName = data.game_settings?.season || "2026/27";

  const startYear = parseInt(seasonName.substring(0, 4), 10);
  const endYear = startYear + 1;

  const seasons = [
    {
      season_id: 1,
      season_name: seasonName,
      start_year: startYear,
      end_year: endYear,
      is_current: true,
    },
  ];

  const { data: result, error } = await supabaseAdmin
    .from("seasons")
    .upsert(seasons, {
      onConflict: "season_id",
    })
    .select();

  if (error) {
    throw error;
  }

  return {
    synced: result?.length ?? 0,
  };
}