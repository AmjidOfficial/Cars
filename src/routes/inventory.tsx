import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { supabase } from "@/integrations/supabase/client";
import { VehicleCard, type VehicleCardData } from "@/components/vehicle-card";
import { Search, X } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional().default(""),
  type: z.string().optional().default(""),
  make: z.string().optional().default(""),
  city: z.string().optional().default(""),
});

export const Route = createFileRoute("/inventory")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Inventory — Bazar360" },
      { name: "description", content: "Browse and filter every vehicle across Bazar360 showrooms." },
      { property: "og:title", content: "Inventory — Bazar360" },
      { property: "og:description", content: "Searchable inventory across all dealerships." },
    ],
  }),
  component: InventoryPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center text-sm text-muted-foreground">
      Couldn't load inventory: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center text-sm text-muted-foreground">
      No vehicles found.
    </div>
  ),
});

type Row = VehicleCardData & { showroom: { name: string; slug: string; city: string | null; is_flagship: boolean } | null };

function InventoryPage() {
  const { q, type, make, city } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  function set(key: "q" | "type" | "make" | "city", value: string) {
    navigate({ search: (prev) => ({ ...prev, [key]: value }) });
  }
  function clearAll() {
    navigate({ search: () => ({ q: "", type: "", make: "", city: "" }) });
  }

  const all = useQuery({
    queryKey: ["inventory-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id,title,brand,model_year,mileage_km,fuel_type,price_pkr,price_formatted,images,is_premium,status,showroom:showrooms(name,slug,city,is_flagship)")
        .order("is_premium", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const brands = useMemo(() => {
    const set = new Set<string>();
    all.data?.forEach((v) => v.brand && set.add(v.brand));
    return Array.from(set).sort();
  }, [all.data]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    all.data?.forEach((v) => v.showroom?.city && set.add(v.showroom.city));
    return Array.from(set).sort();
  }, [all.data]);

  const filtered = useMemo(() => {
    let rows = all.data ?? [];
    if (q.trim()) {
      const t = q.toLowerCase();
      rows = rows.filter(
        (v) =>
          v.title.toLowerCase().includes(t) ||
          v.brand.toLowerCase().includes(t) ||
          v.showroom?.name.toLowerCase().includes(t),
      );
    }
    if (make) rows = rows.filter((v) => v.brand.toLowerCase() === make.toLowerCase());
    if (city) rows = rows.filter((v) => v.showroom?.city?.toLowerCase() === city.toLowerCase());
    // 'type' is informational — inventory has no category column yet. Keep in URL for share-back.
    return rows;
  }, [all.data, q, make, city]);

  const flagshipRows = filtered.filter((v) => v.showroom?.is_flagship);
  const otherRows = filtered.filter((v) => !v.showroom?.is_flagship);
  const activeFilters = [type, make, city, q].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-24">
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-display">Every vehicle, one platform</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {all.isLoading ? "Loading inventory…" : `${filtered.length} of ${all.data?.length ?? 0} vehicles`}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Search make, model, or showroom"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={type}
          onChange={(e) => set("type", e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Types</option>
          {["Cars", "Motorcycles", "Trucks", "Auto Parts"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={make}
          onChange={(e) => set("make", e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Any Make</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          value={city}
          onChange={(e) => set("city", e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Any City</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        </div>
      )}

      {flagshipRows.length > 0 && (
        <section className="mt-12">
          <div className="text-[10px] tracking-widest uppercase text-primary mb-4">
            Flagship · Auto Choice Peshawar
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {flagshipRows.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </section>
      )}

      <section className="mt-12">
        {flagshipRows.length > 0 && otherRows.length > 0 && (
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground mb-4">
            All showrooms
          </div>
        )}
        {all.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="surface-card aspect-[4/5] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <p className="text-sm text-muted-foreground">No vehicles match your filters yet.</p>
            <Link to="/showrooms" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Browse showrooms instead
            </Link>
          </div>
        ) : otherRows.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {otherRows.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        ) : null}
      </section>
    </div>
  );
}
