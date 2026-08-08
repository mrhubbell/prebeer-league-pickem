import Link from "next/link";
import MemberSelector from "./MemberSelector";

interface LeagueHeaderProps {
  showMemberSelector?: boolean;
}

export default function LeagueHeader({
  showMemberSelector = true,
}: LeagueHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/">
          <h1 className="text-3xl font-black tracking-tight text-white transition hover:text-amber-400">
            🍺 Pre-Beer League Pick'Em
          </h1>
        </Link>
      </div>

      {showMemberSelector && <MemberSelector />}
    </header>
  );
}