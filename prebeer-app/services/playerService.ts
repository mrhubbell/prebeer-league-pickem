import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface Player {
  player_id: number;
  web_name: string;
  first_name: string;
  last_name: string;
  club_id: number;
  club_name: string;
  position: string;
}

export async function getPlayers() {
  const { data, error } = await supabaseAdmin
    .from("players")
    .select(`
      player_id,
      web_name,
      first_name,
      last_name,
      club_id,
      position,
      clubs!players_club_id_fkey (
        club_name
      )
    `)
    .eq("active", true);

  if (error) throw error;

  const players = (data ?? []).map((player: any) => ({
    player_id: player.player_id,
    web_name: player.web_name,
    first_name: player.first_name,
    last_name: player.last_name,
    club_id: player.club_id,
    club_name: player.clubs?.club_name ?? "",
    position: player.position,
  })) as Player[];

  players.sort((a, b) => {
    const clubCompare = a.club_name.localeCompare(b.club_name);

    if (clubCompare !== 0) {
      return clubCompare;
    }

    return a.web_name.localeCompare(b.web_name);
  });

  return players;
}