"use client";

import { useEffect, useState } from "react";

interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  team_name: string | null;
  email: string | null;
}

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  mode?: "add" | "edit";
  member?: Member | null;
}

export default function MemberModal({
  open,
  onClose,
  onSaved,
  mode = "add",
  member,
}: MemberModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === "edit" && member) {
      setFirstName(member.first_name);
      setLastName(member.last_name);
      setDisplayName(member.display_name);
      setTeamName(member.team_name ?? "");
      setEmail(member.email ?? "");
    }

    if (mode === "add") {
      clearForm();
    }
  }, [member, mode]);

  function clearForm() {
    setFirstName("");
    setLastName("");
    setDisplayName("");
    setTeamName("");
    setEmail("");
    setMessage("");
  }

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setMessage("First Name and Last Name are required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const endpoint =
        mode === "add"
          ? "/api/members/create"
          : "/api/members/update";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: member?.member_id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name:
            displayName.trim() || firstName.trim(),
          team_name: teamName.trim(),
          email: email.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      onSaved?.();

      clearForm();

      onClose();

    } catch (err: any) {
      setMessage(err.message || "Unable to save member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!member) return;

    if (!confirm(`Deactivate ${member.display_name}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/members/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: member.member_id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      onSaved?.();

      onClose();

    } catch (err: any) {
      setMessage(err.message);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">

      <div className="w-full rounded-t-3xl bg-slate-900 p-6">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            {mode === "add"
              ? "Add Member"
              : "Edit Member"}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <input
            value={firstName}
            onChange={(e) =>
              setFirstName(e.target.value)
            }
            placeholder="First Name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3"
          />

          <input
            value={lastName}
            onChange={(e) =>
              setLastName(e.target.value)
            }
            placeholder="Last Name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3"
          />

          <input
            value={displayName}
            onChange={(e) =>
              setDisplayName(e.target.value)
            }
            placeholder="Display Name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3"
          />

          <input
            value={teamName}
            onChange={(e) =>
              setTeamName(e.target.value)
            }
            placeholder="Team Name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3"
          />

          <input
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Email"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3"
          />

          {message && (
            <div className="rounded-xl bg-slate-800 p-3 text-sm text-amber-300">
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-amber-400 py-3 font-bold text-slate-900"
          >
            {saving
              ? "Saving..."
              : mode === "add"
              ? "Save Member"
              : "Save Changes"}
          </button>

          {mode === "edit" && (
            <button
              onClick={handleDeactivate}
              className="w-full rounded-xl border border-red-600 py-3 font-semibold text-red-400 hover:bg-red-950"
            >
              Deactivate Member
            </button>
          )}

        </div>

      </div>

    </div>
  );
}