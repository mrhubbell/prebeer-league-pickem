import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getGoalScorerPicks(
  matchweekId: number
) {

  const { data, error } = await supabaseAdmin
    .from("goal_scorer_picks")
    .select(`
      goal_pick_id,
      member_id,
      player_id,
      players!goal_scorer_picks_player_id_fkey (
        web_name,
        position
      )
    `)
    .eq("matchweek_id", matchweekId);

  if (error) throw error;

  return data ?? [];

}
export async function getGoalsForMatchweek(
  matchweekId: number
) {

  const { data, error } = await supabaseAdmin
    .from("goals")
    .select(`
      goal_id,
      player_id,
      own_goal,
      penalty,
      fixture:fixtures!goals_fixture_id_fkey (
        matchweek_id
      )
    `);

  if (error) throw error;

  return (data ?? []).filter(
    (goal: any) =>
      goal.fixture?.matchweek_id === matchweekId &&
      !goal.own_goal
  );

}
export async function getAssistPicks(
  matchweekId: number
) {

  const { data, error } = await supabaseAdmin
    .from("assists_picks")
    .select(`
      assist_pick_id,
      member_id,
      player_id,
      players!assist_picks_player_id_fkey (
        web_name
      )
    `)
    .eq("matchweek_id", matchweekId);

  if (error) throw error;

  return data ?? [];

}
export async function getAssistsForMatchweek(
  matchweekId: number
) {

  const { data, error } = await supabaseAdmin
    .from("assists")
    .select(`
      assist_id,
      player_id,
      fixture:fixtures!assists_fixture_id_fkey (
        matchweek_id
      )
    `);

  if (error) throw error;

  return (data ?? []).filter(
    (assist: any) =>
      assist.fixture?.matchweek_id === matchweekId
  );

}
export async function getCleanSheetPicks(
  matchweekId: number
) {

  const { data, error } = await supabaseAdmin
    .from("clean_sheet_picks")
    .select(`
      clean_sheet_pick_id,
      member_id,
      club_id
    `)
    .eq("matchweek_id", matchweekId);

  if (error) throw error;

  return data ?? [];

}