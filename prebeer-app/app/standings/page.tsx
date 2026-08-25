import Leaderboard from "@/components/league/Leaderboard";
import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

export default function StandingsPage() {
  return (
    <PageContainer>

      <div className="mb-8">
  <LeagueHeader showLogo={false} />
</div>

      <div className="space-y-6">

        <Leaderboard />

      </div>

      <BottomNavigation />

    </PageContainer>
  );
}