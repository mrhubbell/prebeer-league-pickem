import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getBootstrapStatic } from "./api";

function mapPosition(position: number): string {
  switch (position) {
    case 1:
      return "GK";
    case 2:
      return "DEF";
    case 3:
      return "MID";
    case 4:
      return "FWD";
    default:
      return "MID";
  }
}

export async function syncPlayers() {
  const data = await getBootstrapStatic();

  const players = data.elements.map((player: any) => ({
    player_id: player.id,
    club_id: player.team,
    first_name: player.first_name,
    last_name: player.second_name,
    web_name: player.web_name,
    position: mapPosition(player.element_type),
    active: player.can_select === true,
  }));

  const { data: result, error } = await supabaseAdmin
    .from("players")
    .upsert(players, {
      onConflict: "player_id",
    })
    .select();

  if (error) {
    throw error;
  }

  return {
    synced: result?.length ?? 0,
  };
}