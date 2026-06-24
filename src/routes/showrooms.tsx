import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/showrooms")({
  head: () => ({
    meta: [
      { title: "Trusted Showrooms — Bazar360" },
      { name: "description", content: "Browse inventory from verified dealerships across Pakistan on Bazar360." },
      { property: "og:title", content: "Trusted Showrooms — Bazar360" },
      { property: "og:description", content: "Verified dealerships across Pakistan." },
    ],
  }),
  component: ShowroomsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center text-sm text-muted-foreground">
      Couldn't load showrooms: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center text-sm text-muted-foreground">
      No showrooms found.
    </div>
  ),
});

function ShowroomsPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const showrooms = useQuery({
    queryKey: ["all-showrooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showrooms")
        .select("id,name,slug,city,tagline,logo_url,is_flagship")
        .eq("is_active", true)
        .order("is_flagship", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Count inventory per showroom in one round-trip
  const counts = useQuery({
    queryKey: ["all-showrooms-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("showroom_id");
      if (error) throw error;
      const m = new Map<string, number>();
      (data ?? []).forEach((r) => m.set(r.showroom_id, (m.get(r.showroom_id) ?? 0) + 1));
      return m;
    },
  });

  const cities = useMemo(() => {
    const set = new Set<string>();
    showrooms.data?.forEach((s) => s.city && set.add(s.city));
    return Array.from(set).sort();
  }, [showrooms.data]);

  const filtered = useMemo(() => {
    let rows = showrooms.data ?? [];
    if (q.trim()) {
      const t = q.toLowerCase();
      rows = rows.filter((s) => s.name.toLowerCase().includes(t) || (s.tagline ?? "").toLowerCase().includes(t));
    }
    if (city) rows = rows.filter((s) => s.city === city);
    return rows;
  }, [showrooms.data, q, city]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-24">
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-display">Trusted Showrooms</h1>
        <p className="mt-2 text-sm text-muted-foreground">Browse inventory from verified dealerships across Pakistan</p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by showroom name"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {showrooms.isLoading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="surface-card h-64 animate-pulse" />
        ))}

        {!showrooms.isLoading && filtered.length === 0 && (
          <div className="col-span-full surface-card p-12 text-center text-sm text-muted-foreground">
            No showrooms match your filters.
          </div>
        )}

        {filtered.map((s) => {
          const initials = s.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
          const listings = counts.data?.get(s.id) ?? 0;
          return (
            <div key={s.id} className="surface-card p-6 flex flex-col items-center text-center relative">
              {s.is_flagship && (
                <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-semibold uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" /> Flagship
                </div>
              )}
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} className="h-16 w-16 rounded-full object-cover border border-border" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/15 text-primary border border-primary/30 grid place-items-center font-display font-bold text-lg">
                  {initials || "S"}
                </div>
              )}
              <div className="mt-4 font-display font-bold text-base line-clamp-1">{s.name}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {s.city ?? "Pakistan"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{listings} listing{listings === 1 ? "" : "s"}</div>
              <Link
                to="/showroom/$slug"
                params={{ slug: s.slug }}
                className="mt-5 w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg border border-border text-primary hover:bg-primary hover:text-primary-foreground transition"
              >
                View Inventory
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
