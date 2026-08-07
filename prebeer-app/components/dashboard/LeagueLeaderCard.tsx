import { LeagueLeader } from "@/lib/types";

interface LeagueLeaderCardProps {
  leader: LeagueLeader;
}

export default function LeagueLeaderCard({
  leader,
}: LeagueLeaderCardProps) {
  const seasonStarted = leader.points > 0;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
        LEAGUE LEADER
      </p>

      <h2 className="mt-3 text-3xl font-bold">
        {leader.name}
      </h2>

      <p className="mt-2 text-slate-300">
        {leader.points} pts
      </p>

      {seasonStarted ? (
        <p className="mt-3 text-sm text-green-400">
          +{leader.weeklyGain} this week
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-400">
          Standings available after Gameweek 1
        </p>
      )}

    </section>
  );
}