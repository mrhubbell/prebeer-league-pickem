import { CalendarDays, Clock3, Circle } from "lucide-react";
import { Gameweek } from "@/lib/types";

interface GameweekHeroProps {
  gameweek: Gameweek;
}

export default function GameweekHero({ gameweek }: GameweekHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 shadow-xl">

      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative">

        <div className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1 text-sm font-semibold text-green-400">
          <Circle className="fill-green-400" size={10} />
          {gameweek.status}
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.35em] text-amber-400">
          CURRENT GAMEWEEK
        </p>

        <div className="mt-2 flex items-end justify-between">

          <div>
            <h1 className="text-7xl font-black leading-none">
              {gameweek.number}
            </h1>

            <p className="mt-2 text-slate-400">
              Season {gameweek.season}
            </p>
          </div>

          <div className="text-right">

            <div className="flex items-center justify-end gap-2 text-slate-300">
              <CalendarDays size={18} />
              <span>{gameweek.deadline.split("•")[0].trim()}</span>
            </div>

            <div className="mt-2 flex items-center justify-end gap-2 text-slate-300">
              <Clock3 size={18} />
              <span>{gameweek.deadline.split("•")[1].trim()}</span>
            </div>

          </div>

        </div>

        <div className="mt-8">

          <div className="flex justify-between text-sm text-slate-400">
            <span>Deadline Countdown</span>
            <span>{gameweek.progress}%</span>
          </div>

          <div className="mt-2 h-3 rounded-full bg-slate-700">
            <div
              className="h-3 rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${gameweek.progress}%` }}
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-4xl font-black tracking-tight">
              {gameweek.countdown.toUpperCase()}
            </p>

            <p className="text-slate-400">
              until picks lock
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}