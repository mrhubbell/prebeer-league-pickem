"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useMember } from "@/context/MemberContext";

interface LeagueHeaderProps {
  showLogo?: boolean;
}

export default function LeagueHeader({
  showLogo = true,
}: LeagueHeaderProps) {
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
    <header>
      {currentMember.displayName && (
        <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            Welcome! Cheers{" "}
            <span className="font-semibold text-white">
              {currentMember.displayName}!
            </span>
          </span>

          <button
            onClick={handleLogout}
            className="text-amber-400 transition hover:text-amber-300"
          >
            Log Out
          </button>
        </div>
      )}

      {showLogo && (
        <div className="flex justify-center">
          <Link href="/" className="block">
            <img
              src="/images/pre-beer-league-logo.png"
              alt="Pre-Beer League Pick 'Em"
              className="w-120 object-contain"
            />
          </Link>
        </div>
      )}
    </header>
  );
}