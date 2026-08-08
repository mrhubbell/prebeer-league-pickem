import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface Standing {
  member_id: number;
  first_name: string;
  last_name: string;
  team_name: string;
  season_points: number;
  rank_change: number;
}

export async function getSeasonStandings() {
  const { data, error } = await supabaseAdmin
    .from("weekly_scores")
    .select(`
      member_id,
      matchweek_id,
      score,
      members!weekly_scores_member_id_fkey (
        first_name,
        last_name,
        team_name
      )
    `);

  if (error) throw error;

  const rows = data ?? [];

  if (rows.length === 0) {
    return [];
  }

  // Find the current and previous scored gameweeks.
  const matchweekIds = [
    ...new Set(rows.map((row) => row.matchweek_id)),
  ].sort((a, b) => b - a);

  const currentMatchweekId = matchweekIds[0];
  const previousMatchweekId = matchweekIds[1];

  // Calculate current season totals.
  const currentTotals = new Map<
    number,
    {
      member_id: number;
      first_name: string;
      last_name: string;
      team_name: string;
      season_points: number;
    }
  >();

  for (const row of rows) {
    const existing = currentTotals.get(row.member_id);

    if (existing) {
      existing.season_points += row.score;
    } else {
      currentTotals.set(row.member_id, {
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

  // Calculate standings after the previous gameweek.
  const previousTotals = new Map<number, number>();

  if (previousMatchweekId !== undefined) {
    for (const row of rows) {
      if (row.matchweek_id <= previousMatchweekId) {
        previousTotals.set(
          row.member_id,
          (previousTotals.get(row.member_id) ?? 0) +
            row.score
        );
      }
    }
  }

  // Sort current standings.
  const currentStandings = [...currentTotals.values()].sort(
    (a, b) => {
      if (b.season_points !== a.season_points) {
        return b.season_points - a.season_points;
      }

      return a.member_id - b.member_id;
    }
  );

  // Calculate previous rankings.
  const previousStandings = [...previousTotals.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0] - b[0];
    });

  const previousRanks = new Map<number, number>();

  previousStandings.forEach(([memberId], index) => {
    previousRanks.set(memberId, index + 1);
  });

  // Add movement information.
  const standings: Standing[] = currentStandings.map(
    (member, index) => {
      const currentRank = index + 1;
      const previousRank =
        previousRanks.get(member.member_id);

      return {
        ...member,
        rank_change:
          previousRank !== undefined
            ? previousRank - currentRank
            : 0,
      };
    }
  );

  return standings;
}