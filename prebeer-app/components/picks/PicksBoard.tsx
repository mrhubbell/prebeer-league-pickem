"use client";
import { useMember } from "@/context/MemberContext";
import { useEffect, useMemo, useState } from "react";

import FixtureCard from "./FixtureCard";
import SavePicksButton from "./SavePicksButton";

interface PicksBoardProps {
  weekNumber: number;
  fixtures: any[];
  featuredMatchFixtureId?: number | null;
  gameOfTheWeekFixtureId?: number | null;
}

export default function PicksBoard({
  weekNumber,
  fixtures,
  featuredMatchFixtureId,
  gameOfTheWeekFixtureId,
}: PicksBoardProps) {
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  function handleSelection(fixtureId: number, result: string) {
    setSelections((prev) => ({
      ...prev,
      [fixtureId]: result,
    }));
  }

  const completedPicks = useMemo(
    () => Object.keys(selections).length,
    [selections]
  );

  const totalFixtures = fixtures.length;

  const progress =
    totalFixtures === 0
      ? 0
      : Math.round((completedPicks / totalFixtures) * 100);

  async function handleSave() {
    const memberId = localStorage.getItem("memberId");

    if (!memberId) {
      setMessage("Select a member first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/picks/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: Number(memberId),
          selections,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setMessage("✅ Picks saved successfully!");
    } catch (err: any) {
      setMessage(err.message || "Unable to save picks.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-4xl font-black">
          Gameweek {weekNumber}
        </h1>

        <p className="mt-4 text-lg font-semibold">
          {completedPicks} of {totalFixtures} Picks Complete
        </p>

        <div className="mt-3 h-3 rounded-full bg-slate-700">
          <div
            className="h-3 rounded-full bg-amber-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-4 text-slate-400">
          Pick the winner of every match.
        </p>
      </div>

      {fixtures.map((fixture) => (
        <FixtureCard
          key={fixture.fixture_id}
          fixture={fixture}
          selection={selections[fixture.fixture_id] ?? null}
          onSelect={handleSelection}
          featuredMatchFixtureId={featuredMatchFixtureId}
          gameOfTheWeekFixtureId={gameOfTheWeekFixtureId}
        />
      ))}

      {message && (
        <div className="rounded-xl bg-slate-800 p-4 text-center text-amber-300">
          {message}
        </div>
      )}

      <SavePicksButton
        disabled={completedPicks !== totalFixtures || saving}
        onClick={handleSave}
      />
    </div>
  );
}