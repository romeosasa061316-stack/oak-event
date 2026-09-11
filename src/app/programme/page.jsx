"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Day = {
  id: string;
  day_number: number;
  day_date: string;
  label: string;
};

type Session = {
  id: string;
  day_id: string;
  start_time: string;
  end_time: string;
  title: string;
  speaker_name: string | null;
  speaker_org: string | null;
  location: string | null;
  session_type: string | null;
};

export default function ProgrammePage() {
  const [days, setDays] = useState<Day[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProgramme() {
      const supabase = createClient();

      const { data: dayData, error: dayError } = await supabase
        .from("programme_days")
        .select("id, day_number, day_date, label")
        .order("day_number");

      const { data: sessionData, error: sessionError } = await supabase
        .from("programme_sessions")
        .select(
          "id, day_id, start_time, end_time, title, speaker_name, speaker_org, location, session_type"
        )
        .order("start_time");

      if (dayError || sessionError) {
        setError("Could not load the programme.");
      } else {
        setDays(dayData ?? []);
        setSessions(sessionData ?? []);
        if (dayData && dayData.length > 0) {
          setActiveDayId(dayData[0].id);
        }
      }
      setLoading(false);
    }

    void loadProgramme();
  }, []);

  const daySessions = sessions.filter((s) => s.day_id === activeDayId);

  return (
    <main className="min-h-screen bg-stone-50 p-4 text-stone-900 md:p-8">
      <section className="mx-auto max-w-2xl">
        
          className="text-sm font-medium text-emerald-700 hover:underline"
          href="/"
        >
          ← Home
        </a>

        <h1 className="mt-4 text-3xl font-bold">Programme</h1>
        <p className="mt-2 text-stone-600">OAK Partner Convening 2026</p>

        {loading ? (
          <p className="mt-6 text-stone-500">Loading programme...</p>
        ) : error ? (
          <p className="mt-6 text-red-700">{error}</p>
        ) : (
          <>
            <div className="mt-6 flex gap-2 overflow-x-auto">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDayId(day.id)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeDayId === day.id
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-700 shadow-sm"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4">
              {daySessions.length === 0 ? (
                <p className="text-stone-500">No sessions for this day yet.</p>
              ) : (
                daySessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-500">
                        {session.start_time} – {session.end_time}
                      </p>
                      {session.session_type ? (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                          {session.session_type}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-lg font-semibold">{session.title}</p>
                    {session.speaker_name ? (
                      <p className="mt-1 text-sm text-stone-600">
                        {session.speaker_name}
                        {session.speaker_org ? ` · ${session.speaker_org}` : ""}
                      </p>
                    ) : null}
                    {session.location ? (
                      <p className="mt-1 text-sm text-stone-500">
                        @ {session.location}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}