export default function GameweekCard() {
  return (
    <section className="rounded-3xl bg-slate-900 p-6 shadow-lg border border-slate-800">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
        Current Gameweek
      </p>

      <h2 className="mt-3 text-6xl font-bold">
        1
      </h2>

      <div className="mt-8">
        <p className="text-slate-400">
          Deadline
        </p>

        <p className="text-2xl font-semibold">
          Friday • 7:00 PM
        </p>

        <p className="mt-2 text-green-400">
          2 Days Remaining
        </p>
      </div>
    </section>
  );
}