"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useMember } from "@/context/MemberContext";

export default function LeagueHeader() {
  const router = useRouter();
  const { currentMember } = useMember();

  async function handleLogout() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <header className="space-y-4">
      <div className="text-right text-xs text-slate-400">
        {currentMember.displayName && (
          <>
            Welcome! Cheers {currentMember.displayName}!{" "}
            <button
              onClick={handleLogout}
              className="text-slate-500 transition hover:text-amber-400"
            >
              [Log Out]
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Link href="/">
          <h1 className="text-3xl font-black tracking-tight text-white transition hover:text-amber-400">
            🍺 Pre-Beer League Pick'Em
          </h1>
        </Link>
      </div>
    </header>
  );
}