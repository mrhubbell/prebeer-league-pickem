"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Trophy } from "lucide-react";

import MemberModal from "./MemberModal";

interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  team_name: string | null;
  email: string | null;
}

interface LeagueManagerProps {
  members: Member[];
}

export default function LeagueManager({
  members,
}: LeagueManagerProps) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null);

  function handleAddMember() {
    setSelectedMember(null);
    setModalOpen(true);
  }

  function handleEditMember(member: Member) {
    setSelectedMember(member);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    setSelectedMember(null);

    router.refresh();
  }

  function handleClose() {
    setModalOpen(false);
    setSelectedMember(null);
  }

  function initials(member: Member) {
    return (
      member.first_name.charAt(0) +
      member.last_name.charAt(0)
    ).toUpperCase();
  }

  return (
    <>
      <div className="space-y-6 pb-24">

        <div>

          <h1 className="text-4xl font-black">
            League Members
          </h1>

          <p className="mt-2 text-slate-400">
            Manage league members and teams.
          </p>

        </div>

        <button
          onClick={handleAddMember}
          className="w-full rounded-2xl bg-amber-400 py-4 text-lg font-bold text-slate-900 transition hover:bg-amber-300"
        >
          + Add Member
        </button>

        {members.length === 0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No members yet.
          </div>

        ) : (

          <div className="space-y-4">

            {members.map((member) => (

              <button
                key={member.member_id}
                onClick={() => handleEditMember(member)}
                className="group w-full rounded-3xl border border-slate-800 bg-slate-900 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-lg font-black text-slate-900">

                    {initials(member)}

                  </div>

                  <div className="flex-1">

                    <h2 className="text-xl font-bold">

                      {member.display_name}

                    </h2>

                    <div className="mt-1 flex items-center gap-2 text-slate-400">

                      <Trophy
                        size={15}
                        className="text-amber-400"
                      />

                      <span>

                        {member.team_name || "No Team Name"}

                      </span>

                    </div>

                  </div>

                  <ChevronRight
                    size={22}
                    className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-amber-400"
                  />

                </div>

              </button>

            ))}

          </div>

        )}

      </div>

      <MemberModal
        open={modalOpen}
        onClose={handleClose}
        onSaved={handleSaved}
        mode={selectedMember ? "edit" : "add"}
        member={selectedMember}
      />

    </>
  );
}