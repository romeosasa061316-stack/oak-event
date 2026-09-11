"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { EVENT, getAttendeeById } from "@/lib/db";
import type { Attendee } from "@/lib/types";
import { CheckCircleIcon, DownloadIcon } from "@/components/icons";

export default function PassPage({ params }: { params: { id: string } }) {
  const [attendee, setAttendee] = useState<Attendee | null | undefined>(undefined);
  const qrWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAttendeeById(params.id).then(setAttendee);
  }, [params.id]);

  function downloadQr() {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas || !attendee) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${attendee.qrCode}.png`;
    a.click();
  }

  if (attendee === undefined) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-ink-muted text-sm">Loading your pass…</div>;
  }

  if (attendee === null) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-ink font-medium">We couldn&apos;t find that registration.</p>
        <Link href="/register" className="text-navy text-sm underline underline-offset-2 mt-2 inline-block">
          Register again
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[672px]">
      <div className="rounded-[30px] bg-[#162E55] px-8 py-7 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">Registration Complete</p>
            <h1 className="mt-2 font-display text-[54px] leading-[0.9] tracking-[-0.06em] text-white">
              You&apos;re Registered,
              <br />
              {attendee.firstName}!
            </h1>
            <p className="mt-3 text-[18px] text-white/70">{attendee.organisation}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-[#dfe4eb] bg-[#f4f5f7] p-6 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
        <div className="mx-auto max-w-[420px] rounded-[18px] border border-[#dfe4eb] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
          <div ref={qrWrapRef} className="mx-auto flex w-full items-center justify-center rounded-[16px] bg-white">
            <QRCodeCanvas value={attendee.qrCode} size={220} level="M" />
          </div>
          <p className="mt-5 text-center text-[12px] font-medium uppercase tracking-[0.25em] text-[#7a8593]">{attendee.qrCode}</p>
          <p className="mt-2 text-center text-[14px] text-[#7b8795]">Present at event entrance for check-in</p>
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-[#dfe4eb] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#7b8795]">Registration Details</p>
        <dl className="text-sm divide-y divide-line">
          <Row label="Name" value={`${attendee.firstName} ${attendee.lastName}`} />
          <Row label="Organisation" value={attendee.organisation} />
          <Row label="Role" value={attendee.role} />
          <Row label="Email" value={attendee.email} />
          <Row label="Event Dates" value={EVENT.dateRange} />
          <Row label="Location" value={EVENT.location} />
        </dl>
      </div>

      <button
        onClick={downloadQr}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#162E55] py-4 text-[28px] font-semibold text-white shadow-[0_0_0_3px_rgba(22,46,85,0.12)] transition-colors hover:bg-[#122a4a]"
      >
        <DownloadIcon className="h-6 w-6" />
        Download QR Code
      </button>

      <Link
        href="/register"
        className="mt-5 block text-center text-[15px] text-[#5f6d7d] hover:text-[#162E55] underline underline-offset-2"
      >
        Register another attendee
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-ink font-medium">{value}</dd>
    </div>
  );
}
