"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useMember } from "@/context/MemberContext";

import GameweekHero from "@/components/dashboard/GameweekHero";
import MyPicksCard from "@/components/dashboard/MyPicksCard";
import LeagueLeaderCard from "@/components/dashboard/LeagueLeaderCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";

interface Dashboard {
  gameweek: {
    status: string;
    number: number;
    season: string;
    deadline: string;
    progress: number;
    countdown: string;
  };
  myWeek: {
  submitted: false,
  correctPredictions: 0,
  completedPredictions: 0,
  goals: 0,
  assists: 0,
  cleanSheets: 0,
  currentRank: null,
  rankChange: 0,
};
  leaders: {
  points: {
    teamName: string;
    value: number;
  } | null;

  matchPredictions: {
    teamName: string;
    value: number;
  } | null;

  goalscorers: {
    teamName: string;
    value: number;
  } | null;

  assists: {
    teamName: string;
    value: number;
  } | null;

  cleanSheets: {
    teamName: string;
    value: number;
  } | null;
};
  activity: {
    id: number;
    title: string;
    message: string;
    time: string;
  }[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomeContent() {
  const { currentMember, loading: memberLoading } =
    useMember();

  const [dashboard, setDashboard] =
    useState<Dashboard | null>(null);

  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  useEffect(() => {
    async function loadDashboard() {
      if (!currentMember.memberId) {
        setDashboard(null);
        return;
      }

      setDashboardLoading(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setDashboard(null);
          return;
        }

        const response = await fetch("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setDashboard(result.dashboard);
        } else {
          console.error(
            "Unable to load dashboard:",
            result.message
          );
          setDashboard(null);
        }
      } catch (error) {
        console.error(
          "Unable to load dashboard:",
          error
        );
        setDashboard(null);
      } finally {
        setDashboardLoading(false);
      }
    }

    if (!memberLoading) {
      loadDashboard();
    }
  }, [currentMember.memberId, memberLoading]);

  if (memberLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  /*
   * Logged-out Home
   */
  if (!currentMember.memberId) {
    return (
      <div className="space-y-8 py-8">

        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-400">
            PRE-BEER LEAGUE PICK&apos;EM
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Welcome to the league! 🍻
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-slate-400">
            Predict. Compete. Drink responsibly-ish.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-xl bg-amber-400 px-5 py-4 text-center font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Log In
          </Link>

          <Link
            href="/league"
            className="block w-full rounded-xl border border-slate-700 px-5 py-4 text-center font-bold text-white transition hover:border-amber-400 hover:text-amber-400"
          >
            🍻 Join the League
          </Link>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Make your predictions.
          </h2>

          <p className="mt-3 text-slate-400">
            Predict the results of each week&apos;s Premier
            League matches and compete against the rest of
            the league.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
            SCORING
          </p>

          <div className="mt-4 space-y-3 text-slate-300">
            <p>⚽ Match Predictions</p>
            <p>🥅 Goalscorers</p>
            <p>🎯 Assists</p>
            <p>🧤 Clean Sheets</p>
          </div>
        </div>

      </div>
    );
  }

  /*
   * Logged-in Home
   */
  if (dashboardLoading || !dashboard) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Loading your dashboard...
      </div>
    );
  }

  return (
  <div className="space-y-5 pb-24">

    <GameweekHero gameweek={dashboard.gameweek} />

    <LeagueLeaderCard leaders={dashboard.leaders} />

    <div className="grid grid-cols-2 gap-4">
      <MyPicksCard myWeek={dashboard.myWeek} />

      <RecentActivityCard activity={dashboard.activity} />
    </div>

  </div>
);
}