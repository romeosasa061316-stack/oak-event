"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

type ScanResult = {
  success: boolean;
  message: string;
  attendee_name: string | null;
  already_checked_in: boolean;
  checked_in_at: string | null;
};

const EVENT_DATES = [
  { value: "2026-11-09", label: "Day 1 — Monday 9 November" },
  { value: "2026-11-10", label: "Day 2 — Tuesday 10 November" },
  { value: "2026-11-11", label: "Day 3 — Wednesday 11 November" },
];

export default function ScannerPage() {
  const scannerReference = useRef<Html5QrcodeScanner | null>(null);
  const processingReference = useRef(false);

  const [eventDate, setEventDate] = useState("2026-11-09");
  const [location, setLocation] = useState("Main entrance");
  const [status, setStatus] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  async function submitScan(qrCodeData: string) {
    if (processingReference.current) return;

    processingReference.current = true;
    setError("");
    setStatus(null);

    try {
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeData,
          checkInDate: eventDate,
          location,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Could not record check-in.");
        return;
      }

      setStatus(result.result);
    } catch {
      setError("Connection problem. Try scanning again.");
    } finally {
      window.setTimeout(() => {
        processingReference.current = false;
      }, 2000);
    }
  }

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "oak-qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        void submitScan(decodedText);
      },
      () => undefined
    );

    scannerReference.current = scanner;

    return () => {
      scanner.clear().catch(() => undefined);
    };
  }, [eventDate, location]);

  return (
    <main className="min-h-screen bg-stone-50 p-4 text-stone-900 md:p-8">
      <section className="mx-auto max-w-xl">
        <a
          className="text-sm font-medium text-emerald-700 hover:underline"
          href="/admin/dashboard"
        >
          ← Dashboard
        </a>

        <h1 className="mt-4 text-3xl font-bold">Attendance scanner</h1>
        <p className="mt-2 text-stone-600">
          Point the phone camera at an attendee QR code.
        </p>

        <div className="mt-6 grid gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <label>
            <span className="mb-2 block text-sm font-medium">Event day</span>
            <select
              className="w-full rounded-lg border border-stone-300 px-3 py-3"
              onChange={(event) => setEventDate(event.target.value)}
              value={eventDate}
            >
              {EVENT_DATES.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Check-in point</span>
            <input
              className="w-full rounded-lg border border-stone-300 px-3 py-3"
              onChange={(event) => setLocation(event.target.value)}
              value={location}
            />
          </label>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
          <div id="oak-qr-reader" />
        </div>

        {status ? (
          <div
            className={`mt-6 rounded-2xl p-5 ${
              status.already_checked_in
                ? "bg-amber-50 text-amber-900"
                : "bg-emerald-50 text-emerald-900"
            }`}
          >
            <p className="font-semibold">{status.message}</p>
            {status.attendee_name ? (
              <p className="mt-1 text-lg">{status.attendee_name}</p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-red-800">
            {error}
          </div>
        ) : null}
      </section>
    </main>
  );
}