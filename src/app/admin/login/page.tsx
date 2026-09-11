"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Login failed. Check your email and password.");
      setLoading(false);
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 p-4">
      <form
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
        onSubmit={handleLogin}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          OAK Zimbabwe Foundation
        </p>

        <h1 className="mt-3 text-3xl font-bold">Coordinator login</h1>

        <p className="mt-2 text-sm text-stone-600">
          This area is for approved event coordination staff only.
        </p>

        <label className="mt-7 block">
          <span className="mb-2 block text-sm font-medium">Email address</span>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-3"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-3"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error ? (
          <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="mt-6 w-full rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}