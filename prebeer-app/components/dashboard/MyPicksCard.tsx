import { MyWeek } from "@/lib/types";

interface MyPicksCardProps {
  myWeek: MyWeek;
}

export default function MyPicksCard({
  myWeek,
}: MyPicksCardProps) {
  const hasCompletedMatches =
    myWeek.completedPredictions > 0;

  const rankDisplay =
    myWeek.currentRank !== null
      ? `#${myWeek.currentRank}`
      : "#—";

  let movementText = "— this week";
  let movementClass = "text-slate-500";

  if (myWeek.rankChange > 0) {
    movementText = `↑ ${myWeek.rankChange} this week`;
    movementClass = "text-green-400";
  } else if (myWeek.rankChange < 0) {
    movementText = `↓ ${Math.abs(myWeek.rankChange)} this week`;
    movementClass = "text-red-400";
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

      <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
        MY WEEK
      </p>

      {/* Rank */}
      <div className="mt-4">
        <p className="text-3xl font-black text-white">
          {rankDisplay}
        </p>

        <p className={`mt-1 text-sm font-semibold ${movementClass}`}>
          {movementText}
        </p>
      </div>

      {/* Match prediction accuracy */}
      <div className="mt-6">
        <p className="text-3xl font-black text-white">
          {hasCompletedMatches
            ? `${myWeek.correctPredictions} / ${myWeek.completedPredictions}`
            : "— / 0"}
        </p>

        <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
          Match Predictions
        </p>
      </div>

      {/* Bonus performance */}
      <div className="mt-6 space-y-2 text-sm">

        <div className="flex justify-between">
          <span className="text-slate-400">
            Goals
          </span>

          <span className="font-bold text-white">
            {myWeek.goals}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Assists
          </span>

          <span className="font-bold text-white">
            {myWeek.assists}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Clean Sheets
          </span>

          <span className="font-bold text-white">
            {myWeek.cleanSheets}
          </span>
        </div>

      </div>

      {/* Submission status */}
      <div className="mt-6 border-t border-slate-800 pt-4">

        {myWeek.submitted ? (
          <p className="text-sm font-bold text-green-400">
            ✓ PICKS SUBMITTED
          </p>
        ) : (
          <p className="text-sm font-bold text-amber-400">
            ⚠ PICKS NOT SUBMITTED
          </p>
        )}

      </div>

    </section>
  );
}