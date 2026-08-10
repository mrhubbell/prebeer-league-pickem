import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

export default function HowItWorksPage() {
  return (
    <PageContainer>
      <LeagueHeader />

      <main className="space-y-6 pb-24">

        {/* Page Header */}
        <div className="text-center pt-4">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
            PRE-BEER LEAGUE PICK&apos;EM
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            How It Works
          </h1>

          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Predict. Score. Talk trash. Repeat. 🍻
          </p>
        </div>

        {/* Match Predictions */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚽</div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-400">
                1. Match Predictions
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Pick the results
              </h2>
            </div>
          </div>

          <p className="mt-4 text-slate-400">
            Pick the result of every Premier League match each gameweek.
          </p>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-3">
              <span className="text-slate-300">
                Correct Match Prediction
              </span>
              <span className="font-black text-amber-400">
                1 point
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-3">
              <span className="text-slate-300">
                Featured Match
              </span>
              <span className="font-black text-amber-400">
                2 points
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-3">
              <span className="text-slate-300">
                Match of the Week
              </span>
              <span className="font-black text-amber-400">
                3 points
              </span>
            </div>
          </div>

          {/* Weekly Bonus */}
          <div className="mt-6 border-t border-slate-800 pt-5">
            <p className="text-sm font-bold text-white">
              🔥 Weekly Prediction Bonus
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Get hot and earn bonus points for your best weeks.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-800/70 p-3 text-center">
                <p className="text-xl font-black text-white">7</p>
                <p className="text-xs text-slate-500">correct</p>
                <p className="mt-1 font-bold text-amber-400">+2</p>
              </div>

              <div className="rounded-xl bg-slate-800/70 p-3 text-center">
                <p className="text-xl font-black text-white">8</p>
                <p className="text-xs text-slate-500">correct</p>
                <p className="mt-1 font-bold text-amber-400">+4</p>
              </div>

              <div className="rounded-xl bg-slate-800/70 p-3 text-center">
                <p className="text-xl font-black text-white">9</p>
                <p className="text-xs text-slate-500">correct</p>
                <p className="mt-1 font-bold text-amber-400">+7</p>
              </div>

              <div className="rounded-xl bg-slate-800/70 p-3 text-center">
                <p className="text-xl font-black text-white">10</p>
                <p className="text-xs text-slate-500">correct</p>
                <p className="mt-1 font-bold text-amber-400">+10</p>
              </div>
            </div>
          </div>
        </section>

        {/* Goalscorers */}
<section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
  <div className="flex items-center gap-3">
    <div className="text-3xl">🥅</div>

    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-amber-400">
        2. Goalscorers
      </p>

      <h2 className="mt-1 text-2xl font-black">
        Pick your scorers
      </h2>
    </div>
  </div>

  <p className="mt-4 text-slate-400">
    Pick two eligible players each gameweek. Every goal they
    score earns points based on their position.
  </p>

  <div className="mt-5 space-y-2">
    <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-3">
      <span>🛡️ Defender</span>
      <span className="font-black text-amber-400">
        12 pts / goal
      </span>
    </div>

    <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-3">
      <span>⚙️ Midfielder</span>
      <span className="font-black text-amber-400">
        4 pts / goal
      </span>
    </div>

    <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-3">
      <span>⚽ Forward</span>
      <span className="font-black text-amber-400">
        2 pts / goal
      </span>
    </div>
  </div>

  <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-slate-300">
    🍻{" "}
    <span className="font-bold text-white">
      Feeling brave?
    </span>{" "}
    A defender goal is worth 6× a forward goal. Imagine if they score 2. 🤔
  </div>

  </section>

        {/* Assists */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-400">
                3. Assists
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Pick your playmakers
              </h2>
            </div>
          </div>

          <p className="mt-4 text-slate-400">
            Pick two players each gameweek.
          </p>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-4">
            <span className="text-slate-300">
              Points per assist
            </span>

            <span className="text-2xl font-black text-amber-400">
              +2
            </span>
          </div>
        </section>

        {/* Clean Sheets */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🧤</div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-400">
                4. Clean Sheets
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Back a shutout
              </h2>
            </div>
          </div>

          <p className="mt-4 text-slate-400">
            Pick one club each gameweek. If they keep a clean sheet,
            you earn bonus points.
          </p>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-800/70 px-4 py-4">
            <span className="text-slate-300">
              Correct Clean Sheet
            </span>

            <span className="text-2xl font-black text-amber-400">
              +3
            </span>
          </div>
        </section>

        {/* How You Score */}
<section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
  <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
    THE BIG PICTURE
  </p>

  <h2 className="mt-2 text-2xl font-black">
    How you score
  </h2>

  <p className="mt-4 text-slate-300">
    Your weekly score is the sum of your:
  </p>

  <div className="mt-5 space-y-3">
    <div className="flex items-center gap-3">
      <span className="text-xl">⚽</span>
      <span className="font-semibold text-white">
        Match Predictions
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xl">🔥</span>
      <span className="font-semibold text-white">
        Weekly Prediction Bonus
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xl">🥅</span>
      <span className="font-semibold text-white">
        Goalscorers
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xl">🎯</span>
      <span className="font-semibold text-white">
        Assists
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xl">🧤</span>
      <span className="font-semibold text-white">
        Clean Sheets
      </span>
    </div>
  </div>

  <div className="mt-6 border-t border-amber-400/20 pt-5 text-center">
    <p className="font-black text-amber-400">
      Put it all together → that&apos;s your weekly score.
    </p>
  </div>
</section>

        {/* Strategy */}
        <section className="text-center px-4 pt-2">
          <p className="text-lg font-bold text-white">
            🍻 The Pre-Beer Strategy
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Don&apos;t just pick the obvious choice. A defender
            goal can score you more than a forward goal, a Match of the Week
            prediction is worth more than a normal match, and hitting
            10 correct predictions earns you a 10-point bonus. 
            </p>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Drink a beer 🍻 and be bold!
          </p>

          <p className="mt-3 font-black text-amber-400">
            Choose wisely.
          </p>
        </section>

        {/* Back Home */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-block rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-white transition hover:border-amber-400 hover:text-amber-400"
          >
            ← Back Home
          </Link>
        </div>

      </main>

      <BottomNavigation />
    </PageContainer>
  );
}