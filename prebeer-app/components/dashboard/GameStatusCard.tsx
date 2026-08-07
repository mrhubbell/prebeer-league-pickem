export default function GameStatusCard() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

      <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
        GAMEWEEK
      </p>

      <div className="mt-3 flex items-end justify-between">

        <h2 className="text-6xl font-extrabold">
          1
        </h2>

        <div className="text-right">

          <p className="text-sm text-slate-400">
            Deadline
          </p>

          <p className="font-semibold">
            Fri 7:00 PM
          </p>

        </div>

      </div>

      <div className="mt-6 h-2 rounded-full bg-slate-800">

        <div className="h-2 w-2/3 rounded-full bg-amber-400" />

      </div>

      <p className="mt-3 text-green-400">
        2 Days Remaining
      </p>

    </section>
  );
}