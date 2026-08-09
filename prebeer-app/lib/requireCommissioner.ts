import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function requireCommissioner(
  request: Request
) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const accessToken =
    authorization.replace("Bearer ", "");

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(
    accessToken
  );

  if (userError || !user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const { data: member, error: memberError } =
    await supabaseAdmin
      .from("members")
      .select(`
        member_id,
        role,
        active
      `)
      .eq("profile_id", user.id)
      .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  if (!member) {
    throw new Error("NOT_MEMBER");
  }

  if (!member.active) {
    throw new Error("MEMBER_INACTIVE");
  }

  if (member.role !== "COMMISSIONER") {
    throw new Error("NOT_COMMISSIONER");
  }

  return {
    user,
    member,
  };
}