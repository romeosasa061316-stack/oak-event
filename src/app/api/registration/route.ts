import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  organisation: z.string().trim().max(150).optional().nullable(),
  role: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30).optional().nullable(),
  dietaryRequirements: z.string().trim().max(1000).optional().nullable(),
  accessibilityNeeds: z.string().trim().max(1000).optional().nullable(),
  travelRequirements: z.string().trim().max(1000).optional().nullable(),
  consentGiven: z.literal(true),
});

function toNull(value: string | null | undefined) {
  const cleanValue = value?.trim();
  return cleanValue ? cleanValue : null;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Please check the form fields and try again.",
          fields: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = result.data;
    const supabase = createAdminClient();

    const forwardedFor = request.headers.get("x-forwarded-for");
    const registrationIp = forwardedFor?.split(",")[0]?.trim() ?? null;

    const { data: attendee, error } = await supabase
      .from("attendees")
      .insert({
        full_name: data.fullName,
        sub_partner_name: toNull(data.organisation),
        role: toNull(data.role),
        email: data.email.trim().toLowerCase(),
        phone: toNull(data.phone),
        dietary_requirements: toNull(data.dietaryRequirements),
        accessibility_needs: toNull(data.accessibilityNeeds),
        travel_requirements: toNull(data.travelRequirements),
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        registration_ip: registrationIp,
      })
      .select("full_name, role, sub_partner_name, qr_code_data")
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "We could not complete your registration. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        attendee: {
          fullName: attendee.full_name,
          organisation: attendee.sub_partner_name,
          role: attendee.role,
          qrCodeData: attendee.qr_code_data,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid registration request." },
      { status: 400 }
    );
  }
}