"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Star,
  RefreshCw,
  Database,
} from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { useMember } from "@/context/MemberContext";

export default function AdminPage() {
  const router = useRouter();
  const { currentMember, loading } = useMember();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [gameweekSyncing, setGameweekSyncing] = useState(false);
  const [gameweekMessage, setGameweekMessage] = useState("");

  const handleSync = async () => {
  setSyncing(true);
  setSyncMessage("");

  try {
    const response = await fetch("/api/admin/sync");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error?.message || "Premier League sync failed."
      );
    }

    setSyncMessage(
      `Sync complete — ${result.players.synced} players, ${result.fixtures.synced} fixtures.`
    );
  } catch (err) {
    setSyncMessage(
      err instanceof Error
        ? err.message
        : "Premier League sync failed."
    );
  } finally {
    setSyncing(false);
  }
};
const handleGameweekSync = async () => {
  setGameweekSyncing(true);
  setGameweekMessage("");

  try {
    const response = await fetch(
      "/api/fpl/sync/gameweek"
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error?.message ||
          result.error ||
          "Gameweek sync failed."
      );
    }

    if (result.gameweekId === null) {
      setGameweekMessage(
        "No completed Gameweek is available to sync."
      );
      return;
    }

    setGameweekMessage(
      `Gameweek ${result.gameweekId} — ${result.fixturesProcessed} fixtures, ${result.goals} goals, ${result.assists} assists, ${result.cleanSheets} clean sheets.`
    );
  } catch (err) {
    setGameweekMessage(
      err instanceof Error
        ? err.message
        : "Gameweek sync failed."
    );
  } finally {
    setGameweekSyncing(false);
  }
};

  useEffect(() => {
    if (!loading) {
      if (
        !currentMember.memberId ||
        currentMember.role !== "COMMISSIONER"
      ) {
        router.replace("/");
      }
    }
  }, [
    loading,
    currentMember.memberId,
    currentMember.role,
    router,
  ]);

  if (
    loading ||
    !currentMember.memberId ||
    currentMember.role !== "COMMISSIONER"
  ) {
    return null;
  }

  return (
    <PageContainer>
      <div className="space-y-5 pb-24">

        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
            COMMISSIONER PORTAL
          </p>

          <h1 className="mt-3 text-3xl font-black text-white">
            Commissioner Tools
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your league from one place.
          </p>
        </div>

        {/* Featured Matches */}
        <Link
          href="/admin/featured-matches"
          className="block rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-amber-400"
        >
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10">
              <Star
                className="text-amber-400"
                size={24}
              />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                Featured Matches
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Choose the Featured Match and Game
                of the Week for each gameweek.
              </p>
            </div>

            <div className="text-2xl text-slate-500">
              →
            </div>

          </div>
        </Link>

        {/* Sync Premier League Data */}
<button
  onClick={handleSync}
  disabled={syncing}
  className="w-full rounded-3xl bg-amber-400 py-5 text-xl font-bold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
>
  <span className="flex items-center justify-center gap-3">
    <RefreshCw
      size={22}
      className={syncing ? "animate-spin" : ""}
    />
    {syncing
      ? "Syncing Premier League Data..."
      : "Sync Premier League Data"}
  </span>
</button>

{/* Sync Gameweek Data */}
<button
  onClick={handleGameweekSync}
  disabled={gameweekSyncing}
  className="w-full rounded-3xl border border-amber-400 bg-slate-900 py-5 text-xl font-bold text-amber-400 transition hover:bg-amber-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
>
  <span className="flex items-center justify-center gap-3">
    <RefreshCw
      size={22}
      className={
        gameweekSyncing
          ? "animate-spin"
          : ""
      }
    />
    {gameweekSyncing
      ? "Syncing Gameweek Data..."
      : "Sync Gameweek Data"}
  </span>
</button>

{gameweekMessage && (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
    {gameweekMessage}
  </div>
)}

{syncMessage && (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
    {syncMessage}
  </div>
)}

        {/* Database Status */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center gap-3">
            <Database
              className="text-slate-400"
              size={20}
            />

            <h2 className="text-lg font-bold text-white">
              Database Status
            </h2>
          </div>

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