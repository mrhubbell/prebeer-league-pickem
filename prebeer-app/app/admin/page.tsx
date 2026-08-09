"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

        {/* Sync Everything */}
        <button
          className="w-full rounded-3xl bg-amber-400 py-5 text-xl font-bold text-slate-900 transition hover:bg-amber-300"
        >
          <span className="flex items-center justify-center gap-3">
            <RefreshCw size={22} />
            Sync Everything
          </span>
        </button>

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