"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type AttendeePass = {
  fullName: string;
  organisation: string | null;
  role: string | null;
  qrCodeData: string;
};

export default function PassPage() {
  const [attendee, setAttendee] = useState<AttendeePass | null>(null);

  useEffect(() => {
    const savedPass = sessionStorage.getItem("oak-attendee-pass");

    if (!savedPass) {
      return;
    }

    try {
      const parsedPass = JSON.parse(savedPass) as AttendeePass;
      setAttendee(parsedPass);
    } catch {
      sessionStorage.removeItem("oak-attendee-pass");
    }
  }, []);

  if (!attendee) {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-50 p-6">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-stone-900">
            Pass not available
          </h1>

          <p className="mt-3 text-stone-600">
            Please register again to generate your event pass.
          </p>

          <a
            className="mt-6 inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white"
            href="/register"
          >
            Register
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-900">
      <section className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow-md">
        <div className="bg-emerald-700 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest">
            OAK Zimbabwe Foundation
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Partner Gathering 2026
          </h1>

          <p className="mt-2 text-sm text-emerald-100">
            9–11 November · Cresta Lodge, Msasa
          </p>
        </div>

        <div className="p-8 text-center">
          <p className="text-sm text-stone-500">Registered attendee</p>

          <h2 className="mt-2 text-3xl font-bold">
            {attendee.fullName}
          </h2>

          {attendee.organisation ? (
            <p className="mt-2 text-stone-600">
              {attendee.organisation}
            </p>
          ) : null}

          {attendee.role ? (
            <p className="mt-1 text-sm text-stone-500">
              {attendee.role}
            </p>
          ) : null}

          <div className="mx-auto mt-8 inline-block rounded-2xl border border-stone-200 bg-white p-4">
            <QRCodeSVG
              bgColor="#ffffff"
              fgColor="#14532d"
              includeMargin
              level="M"
              size={240}
              value={attendee.qrCodeData}
            />
          </div>

          <p className="mt-6 text-sm text-stone-600">
            Keep this QR code available on your phone. The coordination team
            will scan it at check-in each day.
          </p>

          <button
            className="mt-6 rounded-lg border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
            onClick={() => window.print()}
          >
            Print pass
          </button>
        </div>
      </section>
    </main>
  );
}