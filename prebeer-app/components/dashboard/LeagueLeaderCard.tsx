import { LeagueLeaders } from "@/lib/types";

interface LeagueLeaderCardProps {
  leaders: LeagueLeaders;
}

export default function LeagueLeaderCard({
  leaders,
}: LeagueLeaderCardProps) {
  const formatPercentage = (value: number) =>
    `${value.toFixed(1)}%`;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
            LEAGUE LEADERS
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            Who's dominating?
          </h2>
        </div>

        <div className="text-3xl">
          🏆
        </div>
      </div>

      <div className="mt-6 divide-y divide-slate-800">

        {/* Points */}
        <div className="py-4 first:pt-0 last:pb-0">
          <p className="text-xs font-base uppercase tracking-[0.2em] text-white-400">
            🏆 Top of the Table
          </p>

          {leaders.points ? (
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="truncate text-base font-bold text-white">
                {leaders.points.teamName}
              </p>

              <p className="shrink-0 text-xl font-black text-amber-400">
                {leaders.points.value} pts
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Season starts soon
            </p>
          )}
        </div>

        {/* Match Predictions */}
        <div className="py-4 last:pb-0">
          <p className="text-xs font-base uppercase tracking-[0.2em] text-white-400">
            ⚽ Match Predictions
          </p>

          {leaders.matchPredictions ? (
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="truncate text-base font-bold text-white">
                {leaders.matchPredictions.teamName}
              </p>

              <p className="shrink-0 text-xl font-black text-amber-400">
                {formatPercentage(
                  leaders.matchPredictions.value
                )}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No completed predictions yet
            </p>
          )}
        </div>

        {/* Goals */}
        <div className="py-4 last:pb-0">
          <p className="text-xs font-base uppercase tracking-[0.2em] text-white-400">
            🥅 Golden Boot
          </p>

          {leaders.goalscorers ? (
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="truncate text-base font-bold text-white">
                {leaders.goalscorers.teamName}
              </p>

              <p className="shrink-0 text-xl font-black text-amber-400">
                {leaders.goalscorers.value}{" "}
                {leaders.goalscorers.value === 1
                  ? "Goal"
                  : "Goals"}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No goals yet
            </p>
          )}
        </div>

        {/* Assists */}
        <div className="py-4 last:pb-0">
          <p className="text-xs font-base uppercase tracking-[0.2em] text-white-400">
            🎯 Assists
          </p>

          {leaders.assists ? (
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="truncate text-base font-bold text-white">
                {leaders.assists.teamName}
              </p>

              <p className="shrink-0 text-xl font-black text-amber-400">
                {leaders.assists.value}{" "}
                {leaders.assists.value === 1
                  ? "Assist"
                  : "Assists"}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No assists yet
            </p>
          )}
        </div>

        {/* Clean Sheets */}
        <div className="py-4 last:pb-0">
          <p className="text-xs font-base uppercase tracking-[0.2em] text-white-400">
            🧤 Clean Sheets
          </p>

          {leaders.cleanSheets ? (
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="truncate text-base font-bold text-white">
                {leaders.cleanSheets.teamName}
              </p>

              <p className="shrink-0 text-xl font-black text-amber-400">
                {leaders.cleanSheets.value}{" "}
                {leaders.cleanSheets.value === 1
                  ? "Clean Sheet"
                  : "Clean Sheets"}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No clean sheets yet
            </p>
          )}
        </div>

      </div>
    </section>
  );
}