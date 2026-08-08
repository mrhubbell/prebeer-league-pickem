import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface Standing {
  member_id: number;
  first_name: string;
  last_name: string;
  team_name: string;
  season_points: number;
}

export async function getSeasonStandings() {
  const { data, error } = await supabaseAdmin
    .from("weekly_scores")
    .select(`
      member_id,
      score,
      members!weekly_scores_member_id_fkey (
  first_name,
  last_name,
  team_name
)
    `);

  if (error) throw error;

  const totals = new Map<number, Standing>();

  for (const row of data ?? []) {
    const existing = totals.get(row.member_id);

    if (existing) {
      existing.season_points += row.score;
    } else {
      totals.set(row.member_id, {
  member_id: row.member_id,
  first_name:
    (row.members as any)?.first_name ?? "",
  last_name:
    (row.members as any)?.last_name ?? "",
  team_name:
    (row.members as any)?.team_name ?? "Unknown",
  season_points: row.score,
});
    }
  }

  return [...totals.values()].sort(
    (a, b) => b.season_points - a.season_points
  );
}