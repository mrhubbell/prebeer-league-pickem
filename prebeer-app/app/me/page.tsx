import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

export default function ProfilePage() {
  return (
    <PageContainer>

      <LeagueHeader />

      <div className="space-y-6">

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-3xl font-bold">
            My Profile
          </h2>

          <p className="mt-3 text-slate-400">
            Personal stats, achievements, badges and season history will appear here.
          </p>

        </div>

      </div>

      <BottomNavigation />

    </PageContainer>
  );
}