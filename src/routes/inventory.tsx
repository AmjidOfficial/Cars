import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleCard, type VehicleCardData } from "@/components/vehicle-card";
import { Search } from "lucide-react";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Bazar360" },
      { name: "description", content: "Browse and filter every vehicle across Bazar360 showrooms." },
      { property: "og:title", content: "Inventory — Bazar360" },
      { property: "og:description", content: "Searchable inventory across all dealerships." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string>("");

  const all = useQuery({
    queryKey: ["inventory-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id,title,brand,model_year,mileage_km,fuel_type,price_pkr,price_formatted,images,is_premium,status,showroom:showrooms(name,slug,is_flagship)")
        .order("is_premium", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (VehicleCardData & { showroom: { name: string; slug: string; is_flagship: boolean } | null })[];
    },
  });

  const brands = useMemo(() => {
    const set = new Set<string>();
    all.data?.forEach((v) => v.brand && set.add(v.brand));
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
    if (brand) rows = rows.filter((v) => v.brand === brand);
    return rows;
  }, [all.data, q, brand]);

  const flagshipRows = filtered.filter((v) => v.showroom?.is_flagship);
  const otherRows = filtered.filter((v) => !v.showroom?.is_flagship);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-24">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Inventory</div>
      <h1 className="mt-2 font-display text-4xl tracking-display">Every vehicle, one platform</h1>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by make, model, or showroom"
            className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

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
        {flagshipRows.length > 0 && (
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground mb-4">
            All showrooms
          </div>
        )}
        {all.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="surface-card aspect-[4/5] animate-pulse" />)}
          </div>
        ) : otherRows.length === 0 && flagshipRows.length === 0 ? (
          <div className="surface-card p-12 text-center text-muted-foreground text-sm">
            No vehicles match your filters yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {otherRows.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        )}
      </section>
    </div>
  );
}
