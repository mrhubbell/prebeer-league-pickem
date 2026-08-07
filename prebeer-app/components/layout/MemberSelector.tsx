"use client";

import { useEffect, useState } from "react";

import { useMember } from "@/context/MemberContext";

interface Member {
  member_id: number;
  display_name: string;
}

export default function MemberSelector() {
  const [members, setMembers] = useState<Member[]>([]);

  const {
    currentMember,
    setCurrentMember,
  } = useMember();

  useEffect(() => {
    async function loadMembers() {
      const response = await fetch("/api/members");
      const result = await response.json();

      if (!result.success) return;

      setMembers(result.members);

      if (
        !currentMember.memberId &&
        result.members.length > 0
      ) {
        setCurrentMember(
          result.members[0].member_id,
          result.members[0].display_name
        );
      }
    }

    loadMembers();
  }, [currentMember.memberId, setCurrentMember]);

  if (members.length === 0) return null;

  return (
    <div className="mt-4">

      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
        Playing As
      </label>

      <select
        value={currentMember.memberId ?? ""}
        onChange={(e) => {
          const selected = members.find(
            (m) => m.member_id === Number(e.target.value)
          );

          if (!selected) return;

          setCurrentMember(
            selected.member_id,
            selected.display_name
          );
        }}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
      >
        {members.map((member) => (
          <option
            key={member.member_id}
            value={member.member_id}
          >
            {member.display_name}
          </option>
        ))}
      </select>

    </div>
  );
}