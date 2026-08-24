"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useMember } from "@/context/MemberContext";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FixtureCard from "./FixtureCard";
import SavePicksButton from "./SavePicksButton";
import BonusPicksCard from "./BonusPicksCard";

interface PicksBoardProps {
  weekNumber: number;
  matchweekId: number;
  matchweekStatus: string;

  availableGameweeks: {
    matchweek_id: number;
    week_number: number;
    status: string;
  }[];

  fixtures: any[];
  featuredMatchFixtureId?: number | null;
  gameOfTheWeekFixtureId?: number | null;
}

export default function PicksBoard({
  weekNumber,
  matchweekId,
  matchweekStatus,
  availableGameweeks,
  fixtures,
  featuredMatchFixtureId,
  gameOfTheWeekFixtureId,
}: PicksBoardProps) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState<any[]>([]);

  const [goalPick1, setGoalPick1] =
    useState<number | null>(null);

  const [goalPick2, setGoalPick2] =
    useState<number | null>(null);

  const [assistPick1, setAssistPick1] =
    useState<number | null>(null);

  const [assistPick2, setAssistPick2] =
    useState<number | null>(null);

  const [clubs, setClubs] = useState<any[]>([]);

  const [cleanSheetClubId, setCleanSheetClubId] =
    useState<number | null>(null);

  const { currentMember } = useMember();

  useEffect(() => {
    async function loadPicks() {
      if (!currentMember.memberId) {
        setSelections({});
        return;
      }

      try {
        const response = await fetch(
          `/api/picks/member?memberId=${currentMember.memberId}`
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setSelections(result.selections ?? {});
        }
      } catch (err) {
        console.error("Unable to load picks:", err);
      }
    }

    loadPicks();
  }, [currentMember.memberId]);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const response = await fetch("/api/players");
        const result = await response.json();

        if (response.ok && result.success) {
          setPlayers(result.players);
        }
      } catch (err) {
        console.error("Unable to load players:", err);
      }
    }

    loadPlayers();
  }, []);

  useEffect(() => {
    async function loadClubs() {
      try {
        const response = await fetch("/api/clubs");
        const result = await response.json();

        if (response.ok && result.success) {
          setClubs(result.clubs);
        }
      } catch (err) {
        console.error("Unable to load clubs:", err);
      }
    }

    loadClubs();
  }, []);

  useEffect(() => {
    async function loadGoalScorerPicks() {
      if (!currentMember.memberId) {
        setGoalPick1(null);
        setGoalPick2(null);
        return;
      }

      if (!matchweekId === null) {
        return;
      }

      try {
        const response = await fetch(
          `/api/goalscorers/member?memberId=${currentMember.memberId}&matchweekId=${matchweekId}`
        );

        const result = await response.json();

        if (response.ok && result.success) {
          const pick1 = result.picks.find(
            (p: any) => p.pick_number === 1
          );

          const pick2 = result.picks.find(
            (p: any) => p.pick_number === 2
          );

          setGoalPick1(pick1?.player_id ?? null);
          setGoalPick2(pick2?.player_id ?? null);
        }
      } catch (err) {
        console.error(
          "Unable to load goalscorer picks:",
          err
        );
      }
    }

    loadGoalScorerPicks();
  }, [currentMember.memberId, matchweekId]);

  useEffect(() => {
    async function loadAssistPicks() {
      if (!currentMember.memberId) {
        setAssistPick1(null);
        setAssistPick2(null);
        return;
      }

      if (!matchweekId) {
        return;
      }

      try {
        const response = await fetch(
          `/api/assists/member?memberId=${currentMember.memberId}&matchweekId=${matchweekId}`
        );

        const result = await response.json();

        if (response.ok && result.success) {
          const pick1 = result.picks.find(
            (p: any) => p.pick_number === 1
          );

          const pick2 = result.picks.find(
            (p: any) => p.pick_number === 2
          );

          setAssistPick1(
            pick1?.player_id ?? null
          );

          setAssistPick2(
            pick2?.player_id ?? null
          );
        }
      } catch (err) {
        console.error(
          "Unable to load assist picks:",
          err
        );
      }
    }

    loadAssistPicks();
  }, [currentMember.memberId, matchweekId]);

  useEffect(() => {
    async function loadCleanSheetPick() {
      if (!currentMember.memberId) {
        setCleanSheetClubId(null);
        return;
      }

      if (!matchweekId === null) {
        return;
      }

      try {
        const response = await fetch(
          `/api/cleansheets/member?memberId=${currentMember.memberId}&matchweekId=${matchweekId}`
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setCleanSheetClubId(
            result.pick?.club_id ?? null
          );
        }
      } catch (err) {
        console.error(
          "Unable to load clean sheet pick:",
          err
        );
      }
    }

    loadCleanSheetPick();
  }, [currentMember.memberId, matchweekId]);

  function handleSelection(
  fixtureId: number,
  result: string
) {
  if (matchweekStatus === "LOCKED") {
    return;
  }

  setSelections((prev) => ({
    ...prev,
      [fixtureId]: result,
    }));
  }

  function handleGoalPickChange(
    pickNumber: number,
    playerId: number
  ) {
    if (pickNumber === 1) {
      setGoalPick1(playerId);
    } else {
      setGoalPick2(playerId);
    }
  }

  function handleAssistPickChange(
    pickNumber: number,
    playerId: number
  ) {
    if (pickNumber === 1) {
      setAssistPick1(playerId);
    } else {
      setAssistPick2(playerId);
    }
  }

  function handleCleanSheetChange(
    clubId: number
  ) {
    setCleanSheetClubId(clubId);
  }

  const completedPicks = useMemo(
    () => Object.keys(selections).length,
    [selections]
  );

  const totalFixtures = fixtures.length;

  const progress =
    totalFixtures === 0
      ? 0
      : Math.round(
          (completedPicks / totalFixtures) * 100
        );

  async function handleSave() {
  const memberId = currentMember.memberId;

  if (!memberId) {
    setMessage("You must be logged in to save picks.");
    return;
  }

    setSaving(true);
    setMessage("");

    const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.access_token) {
  setMessage("You must be logged in to save picks.");
  return;
}

    try {
      const response = await fetch("/api/picks/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    selections,
  }),
});

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      if (
        matchweekId &&
        goalPick1 &&
        goalPick2
      ) {
        const goalResponse = await fetch(
          "/api/goalscorers/save",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              memberId: Number(memberId),
              matchweekId: matchweekId,
              picks: [
                {
                  player_id: goalPick1,
                  pick_number: 1,
                },
                {
                  player_id: goalPick2,
                  pick_number: 2,
                },
              ],
            }),
          }
        );

        const goalResult =
          await goalResponse.json();

        if (
          !goalResponse.ok ||
          !goalResult.success
        ) {
          throw new Error(
            goalResult.message ??
              "Unable to save goalscorer picks."
          );
        }
      }

      if (
        matchweekId &&
        assistPick1 &&
        assistPick2
      ) {
        const assistResponse = await fetch(
          "/api/assists/save",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              memberId: Number(memberId),
              matchweekId: matchweekId,
              picks: [
                {
                  player_id: assistPick1,
                  pick_number: 1,
                },
                {
                  player_id: assistPick2,
                  pick_number: 2,
                },
              ],
            }),
          }
        );

        const assistResult =
          await assistResponse.json();

        if (
          !assistResponse.ok ||
          !assistResult.success
        ) {
          throw new Error(
            assistResult.message ??
              "Unable to save assist picks."
          );
        }
      }

      if (
        matchweekId &&
        cleanSheetClubId
      ) {
        const cleanSheetResponse = await fetch(
          "/api/cleansheets/save",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              memberId: Number(memberId),
              matchweekId: matchweekId,
              pick: {
                club_id: cleanSheetClubId,
              },
            }),
          }
        );

        const cleanSheetResult =
          await cleanSheetResponse.json();

        if (
          !cleanSheetResponse.ok ||
          !cleanSheetResult.success
        ) {
          throw new Error(
            cleanSheetResult.message ??
              "Unable to save clean sheet pick."
          );
        }
      }

      setMessage("✅ Picks saved successfully!");
    } catch (err: any) {
      setMessage(
        err.message || "Unable to save picks."
      );
    } finally {
      setSaving(false);
    }
  }

  const now = new Date();

  const bonusLocked =
    fixtures.length > 0 &&
    new Date(fixtures[0].kickoff_time) <= now;

  return (
  <div className="space-y-5 pb-24">

    {/* Gameweek Header */}
<div className="grid grid-cols-[120px_1fr] items-center gap-1 pt-1">

  {/* Compact Logo */}
  <Link href="/" className="block">
    <img
      src="/images/pre-beer-league-logo.png"
      alt="Pre-Beer League Pick 'Em"
      className="h-[120px] w-[120px] object-contain"
    />
  </Link>

  {/* Gameweek Information */}
  <div className="min-w-0 max-w-[220px]">
    <h1 className="text-3xl font-black leading-tight">
      Gameweek {weekNumber}
    </h1>

    <p className="mt-1 text-base font-semibold">
      {completedPicks} of {totalFixtures} Picks Complete
    </p>

    <div className="mt-2 h-3 w-full rounded-full bg-slate-700">
      <div
        className="h-3 rounded-full bg-amber-400 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>

    <p className="mt-2 text-sm text-slate-400">
      Pick the result of every match.
    </p>
  </div>
</div>

<div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Gameweek
      </p>

      <p className="mt-1 text-lg font-bold text-white">
        Gameweek {weekNumber}
      </p>
    </div>

    <select
      value={matchweekId}
      onChange={(event) => {
        router.push(
          `/picks?gameweek=${event.target.value}`
        );
      }}
      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-white outline-none focus:border-amber-400"
    >
      {availableGameweeks.map((gameweek) => (
        <option
          key={gameweek.matchweek_id}
          value={gameweek.matchweek_id}
        >
          Gameweek {gameweek.week_number}
          {gameweek.status === "LOCKED"
            ? " — Complete"
            : " — Current"}
        </option>
      ))}
    </select>
  </div>
</div>

{matchweekStatus === "LOCKED" && (
  <div className="mb-6 rounded-xl border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm font-semibold text-amber-300">
    🔒 Gameweek {weekNumber} is complete. Your picks are locked.
  </div>
)}

    {/* Fixtures */}
    {fixtures.map((fixture) => (
      <FixtureCard
        key={fixture.fixture_id}
        fixture={fixture}
        selection={
          selections[fixture.fixture_id] ?? null
        }
        onSelect={handleSelection}
        featuredMatchFixtureId={
          featuredMatchFixtureId
        }
        gameOfTheWeekFixtureId={
          gameOfTheWeekFixtureId
        }
        locked={
          new Date(fixture.kickoff_time) <= now
        }
      />
    ))}

    {/* Bonus Picks */}
    <BonusPicksCard
      players={players}
      clubs={clubs}
      goalPick1={goalPick1}
      goalPick2={goalPick2}
      assistPick1={assistPick1}
      assistPick2={assistPick2}
      cleanSheetClubId={cleanSheetClubId}
      onGoalPickChange={
        handleGoalPickChange
      }
      onAssistPickChange={
        handleAssistPickChange
      }
      onCleanSheetChange={
        handleCleanSheetChange
      }
      locked={bonusLocked}
    />

    {/* Save Message */}
    {message && (
      <div className="rounded-xl bg-slate-800 p-4 text-center text-amber-300">
        {message}
      </div>
    )}

    {/* Save Button */}
   <SavePicksButton
  disabled={
    matchweekStatus === "LOCKED" ||
    completedPicks !== totalFixtures ||
    saving
  }
  onClick={handleSave}
/>

  </div>
);
}