"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setMessage(
      "Password reset instructions have been sent to your email."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black">
            🍺 Pre-Beer League Pick&apos;Em
          </h1>

          <p className="mt-3 text-slate-400">
            Forgot your password? Lay off the beers! 🍺
            <br />
            Don&apos;t worry — we&apos;ll send you a link to create a new one.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          {!sent ? (
            <>
              <h2 className="text-2xl font-bold">
                Reset Your Password
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Enter the email address associated with your league
                account and we&apos;ll send you a password reset link.
              </p>

              <form
                onSubmit={handleReset}
                className="mt-6 space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Sending..."
                    : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">

              <div className="text-5xl">
                📬
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                Check Your Email!
              </h2>

              <p className="mt-4 text-slate-400">
                {message}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Don&apos;t see it? Check your spam or junk folder.
              </p>

              <Link
                href="/login"
                className="mt-6 inline-block font-bold text-amber-400 hover:text-amber-300"
              >
                ← Back to Log In
              </Link>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}