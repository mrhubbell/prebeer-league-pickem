"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Your password has been successfully updated!"
    );

    setLoading(false);

    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black">
            🍺 Pre-Beer League Pick&apos;Em
          </h1>

          <p className="mt-3 text-slate-400">
            Let&apos;s get you back in the game.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-bold">
            Create a New Password
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            Enter your new password below.
          </p>

          <form
            onSubmit={handleUpdatePassword}
            className="mt-6 space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                New Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                placeholder="Enter new password"
              />

              <p className="mt-2 text-xs text-slate-500">
                Must be at least 6 characters.
              </p>
            </div>

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
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                placeholder="Enter password again"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-green-900 bg-green-950/40 p-4 text-sm text-green-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Updating Password..."
                : "Reset My Password"}
            </button>

          </form>

        </div>

      </div>
    </main>
  );
}