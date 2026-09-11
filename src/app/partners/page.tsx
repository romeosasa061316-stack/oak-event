"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Partner = {
  id: string;
  name: string;
  sub_partner_name: string | null;
  logo_url: string | null;
  website_url: string | null;
  region: string | null;
  focus_areas: string[] | null;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPartners() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("partner_directory_with_counts")
        .select("id, name, sub_partner_name, logo_url, website_url, region, focus_areas")
        .order("name");

      if (error) {
        setError("Could not load partner directory.");
      } else {
        setPartners(data ?? []);
      }
      setLoading(false);
    }

    void loadPartners();
  }, []);

  const filtered = partners.filter((partner) => {
    const query = search.toLowerCase();
    return (
      partner.name.toLowerCase().includes(query) ||
      partner.region?.toLowerCase().includes(query) ||
      partner.focus_areas?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <main className="min-h-screen bg-stone-50 p-4 text-stone-900 md:p-8">
      <section className="mx-auto max-w-2xl">
        
          className="text-sm font-medium text-emerald-700 hover:underline"
          href="/"
        >
          ← Home
        </a>

        <h1 className="mt-4 text-3xl font-bold">Partner Directory</h1>
        <p className="mt-2 text-stone-600">
          {partners.length} partner organisation{partners.length === 1 ? "" : "s"}
        </p>

        <input
          className="mt-6 w-full rounded-lg border border-stone-300 px-4 py-3"
          placeholder="Search organisations, focus areas..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {loading ? (
          <p className="mt-6 text-stone-500">Loading partners...</p>
        ) : error ? (
          <p className="mt-6 text-red-700">{error}</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {filtered.map((partner) => (
              <div
                key={partner.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-900 text-sm font-semibold text-white">
                    {partner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{partner.name}</p>
                    {partner.region ? (
                      <p className="text-sm text-stone-500">{partner.region}</p>
                    ) : null}
                  </div>
                </div>

                {partner.focus_areas && partner.focus_areas.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {partner.focus_areas.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {partner.website_url ? (
                  
                    className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {partner.website_url}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}