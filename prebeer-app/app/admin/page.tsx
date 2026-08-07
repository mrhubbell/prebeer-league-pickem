import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

export default function AdminPage() {
  return (
    <PageContainer>
      <LeagueHeader />

      <div className="space-y-5 pb-24">

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-3xl font-bold text-white">
            Commissioner Tools
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your league from one place.
          </p>
        </div>

        <button
          className="w-full rounded-3xl bg-amber-400 py-5 text-xl font-bold text-slate-900 transition hover:bg-amber-300"
        >
          🚀 Sync Everything
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-bold text-white">
            Database Status
          </h2>

          <div className="mt-4 space-y-2 text-slate-300">
            <div>✅ Seasons</div>
            <div>✅ Clubs</div>
            <div>✅ Players</div>
            <div>✅ Gameweeks</div>
            <div>✅ Fixtures</div>
          </div>
        </div>

      </div>

      <BottomNavigation />
    </PageContainer>
  );
}