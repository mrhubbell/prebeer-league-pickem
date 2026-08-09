"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JoinLeaguePage() {
  const router = useRouter();

  const [leagueCode, setLeagueCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leagueCode,
          firstName,
          lastName,
          teamName,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to create your account."
        );
      }

      /*
       * Account creation succeeded.
       * Send the member to the login page.
       */
      router.push("/login?registered=true");
    } catch (error: any) {
      setMessage(
        error.message || "Unable to create your league account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black">
            🍺 Pre-Beer League Pick&apos;Em
          </h1>

          <p className="mt-3 text-slate-400">
            Join the league and create your account.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-bold">
            Join the League
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Enter the league code provided by the commissioner.
          </p>

          <form
            onSubmit={handleRegister}
            className="mt-6 space-y-5"
          >

            {/* League Code */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                League Code
              </label>

              <input
                type="text"
                value={leagueCode}
                onChange={(e) => setLeagueCode(e.target.value)}
                required
                autoCapitalize="characters"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white uppercase outline-none transition focus:border-amber-400"
                placeholder="Enter league code"
              />
            </div>

            {/* First Name */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                First Name
              </label>

              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                placeholder="First name"
              />
            </div>

            {/* Last Name */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Last Name
              </label>

              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                placeholder="Last name"
              />
            </div>

            {/* Team Name */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Team Name
              </label>

              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                placeholder="Your fantasy team name"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                placeholder="At least 8 characters"
              />
            </div>

            {/* Confirm Password */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                placeholder="Enter password again"
              />
            </div>

            {message && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating Account..."
                : "Join the League 🍻"}
            </button>

          </form>

          <div className="mt-6 border-t border-slate-800 pt-6 text-center">

            <p className="text-sm text-slate-400">
              Already have an account?
            </p>

            <Link
              href="/login"
              className="mt-2 inline-block font-bold text-amber-400 hover:text-amber-300"
            >
              Log In →
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}