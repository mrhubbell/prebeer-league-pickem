import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

import GameweekHero from "@/components/dashboard/GameweekHero";
import MyPicksCard from "@/components/dashboard/MyPicksCard";
import LeagueLeaderCard from "@/components/dashboard/LeagueLeaderCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";

import { getDashboardData } from "@/services/dashboardService";

export default async function Home() {
  const dashboard = await getDashboardData();

  return (
    <PageContainer>
      <LeagueHeader />

      <div className="space-y-5 pb-24">

        <GameweekHero gameweek={dashboard.gameweek} />

        <div className="grid grid-cols-2 gap-4">

          <MyPicksCard myWeek={dashboard.myWeek} />

          <LeagueLeaderCard leader={dashboard.leader} />

        </div>

        <RecentActivityCard activity={dashboard.activity} />

      </div>

      <BottomNavigation />
    </PageContainer>
  );
}