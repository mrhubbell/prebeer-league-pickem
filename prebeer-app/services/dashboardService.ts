import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getDashboardData() {
  const { data: season } = await supabaseAdmin
    .from("seasons")
    .select("*")
    .eq("is_current", true)
    .single();

  const { data: gameweek } = await supabaseAdmin
    .from("matchweeks")
    .select("*")
    .eq("status", "OPEN")
    .single();

  const [
    clubs,
    players,
    fixtures,
  ] = await Promise.all([
    supabaseAdmin.from("clubs").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("players").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("fixtures").select("*", { count: "exact", head: true }),
  ]);

  const deadline = gameweek?.deadline
    ? (() => {
        const d = new Date(gameweek.deadline);

        const date = d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });

        const time = d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return `${date} • ${time}`;
      })()
    : "Friday, Aug 21 • 3:00 PM";

  return {
    gameweek: {
      status: gameweek?.status ?? "UPCOMING",
      number: gameweek?.week_number ?? 1,
      season: season
        ? `${season.start_year}/${String(season.end_year).slice(-2)}`
        : "2026/27",
      deadline,
      progress: 0,
      countdown: "Live Soon",
    },

    myWeek: {
  submitted: false,
  picksComplete: 0,
  totalMatches: gameweek?.fixture_count ?? 10,
  doublePoints: null,
  triplePoints: null,
},

    leader: {
  name: "Season Starts Soon",
  points: 0,
  weeklyGain: 0,
},

    activity: [
  {
    id: 1,
    title: "Players",
    message: `${players.count ?? 0} players synchronized`,
    time: "Just now",
  },
  {
    id: 2,
    title: "Fixtures",
    message: `${fixtures.count ?? 0} fixtures synchronized`,
    time: "Just now",
  },
  {
    id: 3,
    title: "Clubs",
    message: `${clubs.count ?? 0} clubs synchronized`,
    time: "Just now",
  },
],
  };
}