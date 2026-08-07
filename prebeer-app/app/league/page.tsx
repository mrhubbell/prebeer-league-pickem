import PageContainer from "@/components/layout/PageContainer";
import LeagueHeader from "@/components/layout/LeagueHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

import LeagueManager from "@/components/league/LeagueManager";

import { getMembers } from "@/services/memberService";

export default async function LeaguePage() {
  const members = await getMembers();

  return (
    <PageContainer>
      <LeagueHeader />

      <LeagueManager
        members={members}
      />

      <BottomNavigation />
    </PageContainer>
  );
}