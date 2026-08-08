import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getClubs() {

  const { data, error } = await supabaseAdmin
    .from("clubs")
    .select(`
      club_id,
      club_name,
      badge_code
    `)
    .order("club_name");

  if (error) throw error;

  return data;

}