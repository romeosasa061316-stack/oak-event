import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function GET() {
  const serverSupabase = await createClient();

  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: isAdmin, error: adminCheckError } = await serverSupabase.rpc(
    "is_event_admin"
  );

  if (adminCheckError || !isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase
    .from("admin_attendee_list")
    .select("*")
    .order("full_name");

  if (error || !data) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not export attendees." },
      { status: 500 }
    );
  }

  if (data.length === 0) {
    return new NextResponse("No attendees found.", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => toCsvValue((row as Record<string, unknown>)[header])).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="oak-attendees-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}