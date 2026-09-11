"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Headcount = {
  total_registered: number;
  total_checked_in: number;
  check_in_percentage: number;
};

const EVENT_DATES = [
  { value: "2026-11-09", label: "Day 1" },
  { value: "2026-11-10", label: "Day 2" },
  { value: "2026-11-11", label: "Day 3" },
];

export default function DashboardPage() {
  const [eventDate, setEventDate] = useState("2026-11-09");
  const [headcount, setHeadcount] = useState<Headcount | null>(null);
  const [error, setError] = useState("");

  async function loadHeadcount() {
    const response = await fetch(`/api/admin/headcount?date=${eventDate}`);
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Could not load headcount.");
      return;
    }

    setError("");
    setHeadcount(result.headcount);
  }

  useEffect(() => {
    void loadHeadcount();

    const interval = window.setInterval(() => {
      void loadHeadcount();
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [eventDate]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-stone-50 p-4 text-stone-900 md:p-8">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
              OAK Zimbabwe Foundation
            </p>
            <h1 className="mt-2 text-3xl font-bold">Live attendance</h1>
          </div>

          <button
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {EVENT_DATES.map((date) => (
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                eventDate === date.value
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-stone-700 shadow-sm"
              }`}
              key={date.value}
              onClick={() => setEventDate(date.value)}
            >
              {date.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Registered"
            value={headcount?.total_registered ?? "—"}
          />
          <StatCard
            label="Checked in"
            value={headcount?.total_checked_in ?? "—"}
          />
          <StatCard
            label="Attendance"
            value={
              headcount
                ? `${Number(headcount.check_in_percentage ?? 0).toFixed(0)}%`
                : "—"
            }
          />
        </div>

        {error ? (
          <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
        ) : null}

        <a
          className="mt-8 inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white"
          href="/admin/scanner"
        >
          Open QR scanner
        </a>

        <p className="mt-5 text-sm text-stone-500">
          Headcount refreshes automatically every 10 seconds.
        </p>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
    </article>
  );
}