import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function QuickActionsCard() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
        QUICK ACTIONS
      </p>

      <div className="mt-5 space-y-3">

        <Link
          href="/picks"
          className="flex items-center justify-between rounded-2xl bg-amber-400 px-5 py-4 font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          Make My Picks

          <ArrowRight size={20}/>
        </Link>

        <Link
          href="/standings"
          className="flex items-center justify-between rounded-2xl border border-slate-700 px-5 py-4 transition hover:bg-slate-800"
        >
          View Standings

          <ArrowRight size={20}/>
        </Link>

      </div>

    </section>
  );
}