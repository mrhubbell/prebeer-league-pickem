import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

import HomeContent from "@/components/home/HomeContent";

export default function Home() {
  return (
    <PageContainer>
      <LeagueHeader />

      <div className="mt-6">
        <HomeContent />
      </div>

      <BottomNavigation />
    </PageContainer>
  );
}