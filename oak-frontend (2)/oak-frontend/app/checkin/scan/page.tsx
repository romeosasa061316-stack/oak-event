"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleBadge from "@/components/RoleBadge";
import { getPublicAttendeeList } from "@/lib/db";
import type { PublicAttendee } from "@/lib/types";

const READER_ID = "qr-reader-region";
const DAYS = [1, 2, 3] as const;

function ScanPageInner() {
  const router = useRouter();
  const [day, setDay] = useState<1 | 2 | 3>(1);
  const [attendees, setAttendees] = useState<PublicAttendee[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [cameraStatus, setCameraStatus] = useState<"idle" | "starting" | "running" | "error">("idle");
  const [cameraError, setCameraError] = useState("");
  const [recentCheckins, setRecentCheckins] = useState<(PublicAttendee & { checkedInAt: string })[]>([]);
  const scannerRef = useRef<any>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    getPublicAttendeeList().then(setAttendees);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setCameraStatus("starting");
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const instance = new Html5Qrcode(READER_ID, { verbose: false });
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            if (navigatingRef.current) return;
            navigatingRef.current = true;
            goToResult(decodedText);
          },
          () => {
            /* per-frame scan failure — ignore, expected while searching */
          }
        );
        if (!cancelled) setCameraStatus("running");
      } catch (err: any) {
        if (!cancelled) {
          setCameraStatus("error");
          setCameraError(
            err?.message?.includes("Permission")
              ? "Camera permission denied. Allow camera access or use manual entry below."
              : "Couldn't start the camera. Use manual entry or the simulate list below."
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        instance
          .stop()
          .then(() => instance.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToResult(code: string) {
    const normalized = code.trim();
    if (!normalized) return;
    setRecentCheckins((current) => {
      const match = attendees.find((a) => a.qrCode.toUpperCase() === normalized.toUpperCase());
      if (!match) return current;
      const next = [
        { ...match, checkedInAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ...current.filter((item) => item.id !== match.id),
      ].slice(0, 5);
      return next;
    });
    router.push(`/checkin/result?code=${encodeURIComponent(normalized)}&day=${day}`);
  }

  const mockAttendees = [
    { id: "ms", firstName: "Maria", lastName: "Schmidt", code: "OAK-2026-7842-XKPH", role: "Partner" as const },
    { id: "jo", firstName: "James", lastName: "Odhiambo", code: "OAK-2026-1103-7XQH", role: "OAK Staff" as const },
    { id: "aw", firstName: "Awa", lastName: "Diallo", code: "OAK-2026-3318-ADGE", role: "Coordination Team" as const },
    { id: "fz", firstName: "Fatima", lastName: "Z. Benali", code: "OAK-2026-5592-FWBN", role: "Partner" as const },
  ];

  return (
    <div className="mx-auto max-w-[608px] px-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[32px] font-semibold leading-none text-ink">Event Check-In</h1>
          <p className="mt-2 text-[18px] text-ink-muted">Scan an attendee QR code to check them in</p>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-[12px] border border-line bg-white">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={clsx(
                "px-4 py-2.5 text-[12px] font-medium",
                day === d ? "bg-[#162E55] text-white" : "bg-white text-ink-muted hover:bg-canvas"
              )}
            >
              Day {d}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[24px] bg-[#051d35] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        <div className="relative mx-auto aspect-square w-full max-w-[608px] bg-[#081f36]">
          <div id={READER_ID} className="absolute inset-0 [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-[177px] w-[177px]">
              <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-[12px] border-[4px] border-white/60 border-r-0 border-b-0" />
              <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-[12px] border-[4px] border-white/60 border-l-0 border-b-0" />
              <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-[12px] border-[4px] border-white/60 border-r-0 border-t-0" />
              <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-[12px] border-[4px] border-white/60 border-l-0 border-t-0" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-10 text-center">
            <p className="text-[12px] text-white/65">Position QR code within the frame</p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-[12px] text-white/60">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[10px]">◉</span>
            <span>Hold camera steady · Auto-scans in 1–2 seconds</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-[#dfe4eb] bg-[#f7f7f8] p-4 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8593]">Simulate QR Scan</p>
        <div className="space-y-2">
          {mockAttendees.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-[12px] border border-[#dfe4eb] bg-white px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#162E55] text-[11px] font-semibold text-white">
                {a.firstName.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-ink">{a.firstName} {a.lastName}</span>
                </div>
                <p className="text-[11px] text-[#7b8795]">{a.code}</p>
              </div>

              <RoleBadge role={a.role} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-[#dfe4eb] bg-[#f7f7f8] p-4 shadow-[0_1px_0_rgba(17,24,39,0.02)]">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8593]">Manual Code Entry</p>
        <div className="flex items-center gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="OAK-2026-XXXX-XXXX"
            className="flex-1 rounded-[12px] border border-[#dfe4eb] bg-[#edf1f4] px-4 py-3 text-[16px] text-ink placeholder:text-[#7d8894] focus:border-[#162E55] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20"
          />
          <button
            onClick={() => manualCode.trim() && goToResult(manualCode.trim())}
            className="rounded-[12px] bg-[#162E55] px-5 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#122a4a]"
          >
            Check
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <ProtectedRoute>
      <ScanPageInner />
    </ProtectedRoute>
  );
}
