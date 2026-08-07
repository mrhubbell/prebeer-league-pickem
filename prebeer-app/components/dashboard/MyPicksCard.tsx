import { MyWeek } from "@/lib/types";

interface MyPicksCardProps {
  myWeek: MyWeek;
}

export default function MyPicksCard({ myWeek }: MyPicksCardProps) {
  const status = myWeek.submitted ? "READY" : "ACTION REQUIRED";

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
        MY WEEK
      </p>

      <h2 className="mt-3 text-2xl font-bold">
        {status}
      </h2>

      <p className="mt-4 text-slate-300">
        {myWeek.picksComplete} / {myWeek.totalMatches} picks complete
      </p>

      <div className="mt-5 space-y-2 text-sm">

        <div className="flex justify-between">
          <span className="text-slate-400">Double Points</span>
          <span>{myWeek.doublePoints ?? "Not Selected"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Triple Points</span>
          <span>{myWeek.triplePoints ?? "Not Selected"}</span>
        </div>

      </div>

    </section>
  );
}