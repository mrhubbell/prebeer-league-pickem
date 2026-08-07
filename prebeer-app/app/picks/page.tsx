import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

import PicksBoard from "@/components/picks/PicksBoard";

import { getCurrentGameweekFixtures } from "@/services/picksService";

export default async function PicksPage() {
  const {
    weekNumber,
    fixtures,
    featuredMatchFixtureId,
    gameOfTheWeekFixtureId,
  } = await getCurrentGameweekFixtures();

  return (
    <PageContainer>

      <LeagueHeader />

      <PicksBoard
        weekNumber={weekNumber}
        fixtures={fixtures}
        featuredMatchFixtureId={featuredMatchFixtureId}
        gameOfTheWeekFixtureId={gameOfTheWeekFixtureId}
      />

      <BottomNavigation />

    </PageContainer>
  );
}