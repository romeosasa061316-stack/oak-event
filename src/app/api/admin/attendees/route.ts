import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";

  const adminSupabase = createAdminClient();

  let query = adminSupabase.from("admin_attendee_list").select("*");

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data, error } = await query.order("full_name");

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not load attendees." },
      { status: 500 }
    );
  }

  return NextResponse.json({ attendees: data });
}