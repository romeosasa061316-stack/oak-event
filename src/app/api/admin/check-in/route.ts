import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const checkInSchema = z.object({
  qrCodeData: z.string().trim().min(5).max(200),
  checkInDate: z.string().date(),
  location: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid QR scan request." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in again." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc("validate_and_checkin", {
      p_qr_code_data: parsed.data.qrCodeData,
      p_check_in_date: parsed.data.checkInDate,
      p_location: parsed.data.location ?? null,
    });

    if (error) {
      console.error("Check-in RPC error:", error);

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      result: data?.[0] ?? null,
    });
  } catch (error) {
    console.error("Check-in request error:", error);

    return NextResponse.json(
      { error: "Invalid check-in request." },
      { status: 400 }
    );
  }
}