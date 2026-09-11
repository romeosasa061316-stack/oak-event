import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({
  date: z.string().date(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    date: url.searchParams.get("date"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid event date is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("get_live_headcount", {
    target_date: parsed.data.date,
  });

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "You are not permitted to view headcount." },
      { status: 403 }
    );
  }

  return NextResponse.json({ headcount: data[0] });
}