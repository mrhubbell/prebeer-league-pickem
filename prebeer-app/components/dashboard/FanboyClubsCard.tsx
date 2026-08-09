interface FanboyClub {
  position: number;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface Props {
  clubs: FanboyClub[];
}

const clubCrests: Record<string, string> = {
  Arsenal:
    "https://resources.premierleague.com/premierleague/badges/50/t3.png",

  Chelsea:
    "https://resources.premierleague.com/premierleague/badges/50/t8.png",

  "Manchester United":
    "https://resources.premierleague.com/premierleague/badges/50/t1.png",

  Tottenham:
    "https://resources.premierleague.com/premierleague/badges/50/t6.png",
};

function displayClubName(clubName: string) {
  if (clubName === "Manchester United") {
    return "Man United";
  }

  return clubName;
}

export default function FanboyClubsCard({
  clubs,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4">
        <h2 className="whitespace-nowrap text-xs uppercase tracking-[0.25em] text-amber-400">
          Fanboy Clubs
        </h2>

        <p className="mt-2 text-xs text-slate-500">
          How our four clubs stack up
        </p>
      </div>

      <div className="grid grid-cols-[24px_1fr] items-center border-b border-slate-800 pb-2 text-[10px] uppercase tracking-wider text-slate-500">
        <div>#</div>
        <div>Club</div>
      </div>

      <div className="divide-y divide-slate-800">
        {clubs.map((club) => (
          <div
            key={club.clubName}
            className="grid grid-cols-[24px_1fr] gap-2 py-3"
          >
            {/* Position */}
            <div className="pt-0.5 text-sm text-slate-500">
              {club.position}
            </div>

            {/* Club + crest + stats */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <img
                  src={clubCrests[club.clubName]}
                  alt={`${club.clubName} crest`}
                  className="h-6 w-6 object-contain"
                />

                <p className="whitespace-nowrap text-sm font-semibold leading-tight text-white">
                  {displayClubName(
                    club.clubName
                  )}
                </p>
              </div>

              <div className="mt-1 flex items-center gap-4 text-[10px] text-slate-500">
                <span>
                  {club.played} played
                </span>

                <span>
                  GD{" "}
                  <span
                    className={
                      club.goalDifference > 0
                        ? "text-emerald-400"
                        : club.goalDifference < 0
                        ? "text-red-400"
                        : "text-slate-300"
                    }
                  >
                    {club.goalDifference > 0
                      ? `+${club.goalDifference}`
                      : club.goalDifference}
                  </span>
                </span>

                <span>
                  Pts{" "}
                  <span className="font-bold text-amber-400">
                    {club.points}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}