import Link from "next/link";
import MemberSelector from "./MemberSelector";

export default function LeagueHeader() {
  return (
    <header className="mb-8">

      <div className="flex items-center justify-between">

        <Link href="/">
          <h1 className="text-3xl font-black tracking-tight text-white hover:text-amber-400 transition">
            🍺 Pre-Beer League Pick'Em
          </h1>
        </Link>

      </div>

      <MemberSelector />

    </header>
  );
}