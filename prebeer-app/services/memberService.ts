import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  team_name: string | null;
  email: string | null;
  active: boolean;
}

export async function getMembers() {
  const { data, error } = await supabaseAdmin
    .from("members")
    .select("*")
    .eq("active", true)
    .order("display_name");

  if (error) throw error;

  return data as Member[];
}

export async function getMemberSelector() {
  const { data, error } = await supabaseAdmin
    .from("members")
    .select("member_id, display_name")
    .eq("active", true)
    .order("display_name");

  if (error) throw error;

  return data;
}

export async function createMember(member: {
  first_name: string;
  last_name: string;
  display_name: string;
  team_name: string;
  email?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from("members")
    .insert({
      first_name: member.first_name,
      last_name: member.last_name,
      display_name: member.display_name,
      team_name: member.team_name,
      email: member.email || null,
      active: true,
      joined_date: new Date().toISOString().substring(0, 10),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateMember(member: {
  member_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  team_name: string;
  email?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from("members")
    .update({
      first_name: member.first_name,
      last_name: member.last_name,
      display_name: member.display_name,
      team_name: member.team_name,
      email: member.email || null,
      updated_at: new Date().toISOString(),
    })
    .eq("member_id", member.member_id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deactivateMember(memberId: number) {
  const { data, error } = await supabaseAdmin
    .from("members")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("member_id", memberId)
    .select()
    .single();

  if (error) throw error;

  return data;
}