import Link from "next/link";
export default function CommissionerPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">

      <h1 className="text-4xl font-black">
        Commissioner
      </h1>

      <p className="mt-2 text-slate-400">
        Configure league settings and featured matches.
      </p>

      <div className="mt-8 grid gap-6">

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-bold">
            ⭐ Featured Matches
          </h2>

          <p className="mt-2 text-slate-400">
            Select the Double Point and Triple Point fixtures for each gameweek.
          </p>

          <Link
  href="/commissioner/featured-matches"
  className="mt-6 inline-block rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-900"
>
  Open Featured Matches
</Link>

        </div>

      </div>

    </main>
  );
}