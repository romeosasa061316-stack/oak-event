"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RegistrationForm = {
  fullName: string;
  organisation: string;
  role: string;
  email: string;
  phone: string;
  dietaryRequirements: string;
  accessibilityNeeds: string;
  travelRequirements: string;
  consentGiven: boolean;
};

const initialForm: RegistrationForm = {
  fullName: "",
  organisation: "",
  role: "",
  email: "",
  phone: "",
  dietaryRequirements: "",
  accessibilityNeeds: "",
  travelRequirements: "",
  consentGiven: false,
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof RegistrationForm>(
    key: K,
    value: RegistrationForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Registration failed. Please try again.");
        return;
      }

      sessionStorage.setItem(
        "oak-attendee-pass",
        JSON.stringify(result.attendee)
      );

      router.push(
        `/pass/${encodeURIComponent(result.attendee.qrCodeData)}`
      );
    } catch {
      setError("Connection problem. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-900">
      <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          OAK Zimbabwe Foundation
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Partner Gathering Registration
        </h1>

        <p className="mt-3 text-stone-600">
          Cresta Lodge, Msasa, Harare · 9–11 November 2026
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <FormField
            label="Full name"
            value={form.fullName}
            required
            onChange={(value) => updateField("fullName", value)}
          />

          <FormField
            label="Organisation / sub-partner"
            value={form.organisation}
            onChange={(value) => updateField("organisation", value)}
          />

          <FormField
            label="Role or job title"
            value={form.role}
            onChange={(value) => updateField("role", value)}
          />

          <FormField
            label="Email address"
            type="email"
            value={form.email}
            required
            onChange={(value) => updateField("email", value)}
          />

          <FormField
            label="Phone number"
            type="tel"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
          />

          <TextArea
            label="Dietary requirements"
            value={form.dietaryRequirements}
            onChange={(value) => updateField("dietaryRequirements", value)}
          />

          <TextArea
            label="Accessibility needs"
            value={form.accessibilityNeeds}
            onChange={(value) => updateField("accessibilityNeeds", value)}
          />

          <TextArea
            label="Travel requirements"
            value={form.travelRequirements}
            onChange={(value) => updateField("travelRequirements", value)}
          />

          <label className="flex gap-3 rounded-lg bg-stone-100 p-4 text-sm leading-6 text-stone-700">
            <input
              checked={form.consentGiven}
              className="mt-1 h-4 w-4 shrink-0"
              onChange={(event) =>
                updateField("consentGiven", event.target.checked)
              }
              required
              type="checkbox"
            />

            <span>
              I consent to OAK Zimbabwe and the event coordination team
              collecting and using this information to manage my registration,
              attendance, accommodation, accessibility, dietary, and travel
              arrangements for this event. My information will not be
              published or reused outside this event.
            </span>
          </label>

          {error ? (
            <p
              aria-live="polite"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}

          <button
            className="w-full rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Registering…" : "Register and get my QR pass"}
          </button>
        </form>
      </section>
    </main>
  );
}

function FormField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>

      <input
        className="w-full rounded-lg border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>

      <textarea
        className="min-h-24 w-full rounded-lg border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}