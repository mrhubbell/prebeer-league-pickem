import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import PicksBoard from "@/components/picks/PicksBoard";
import {
  getCurrentGameweekFixtures,
  getGameweekFixtures,
  getAvailableGameweeks,
} from "@/services/picksService";

interface PicksPageProps {
  searchParams: Promise<{
    gameweek?: string;
  }>;
}

export default async function PicksPage({
  searchParams,
}: PicksPageProps) {
  const params = await searchParams;

  const selectedGameweek =
    params.gameweek
      ? Number(params.gameweek)
      : null;

  const [
    currentGameweek,
    availableGameweeks,
  ] = await Promise.all([
    getCurrentGameweekFixtures(),
    getAvailableGameweeks(),
  ]);

  const gameweekData =
    selectedGameweek &&
    Number.isInteger(selectedGameweek)
      ? await getGameweekFixtures(
          selectedGameweek
        )
      : currentGameweek;

  return (
    <PageContainer>

      <LeagueHeader showLogo={false} />

      <PicksBoard
        weekNumber={gameweekData.weekNumber}
        matchweekId={gameweekData.matchweekId}
        matchweekStatus={gameweekData.status}
        fixtures={gameweekData.fixtures}
        featuredMatchFixtureId={
          gameweekData.featuredMatchFixtureId
        }
        gameOfTheWeekFixtureId={
          gameweekData.gameOfTheWeekFixtureId
        }
        availableGameweeks={
          availableGameweeks
        }
      />

      <BottomNavigation />

    </PageContainer>
  );
}
