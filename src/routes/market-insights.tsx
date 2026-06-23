import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/market-insights")({
  head: () => ({ meta: [{ title: "Market Insights — Bazar360" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const stats = useQuery({
    queryKey: ["insights-stats"],
    queryFn: async () => {
      const [{ count: totalVehicles }, { count: totalShowrooms }, { data: brandRows }] = await Promise.all([
        supabase.from("inventory").select("*", { count: "exact", head: true }),
        supabase.from("showrooms").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("inventory").select("brand,price_pkr"),
      ]);
      const byBrand = new Map<string, { count: number; total: number }>();
      brandRows?.forEach((r) => {
        const cur = byBrand.get(r.brand) ?? { count: 0, total: 0 };
        cur.count += 1; cur.total += r.price_pkr ?? 0;
        byBrand.set(r.brand, cur);
      });
      const topBrands = Array.from(byBrand.entries())
        .map(([brand, v]) => ({ brand, count: v.count, avg: v.count ? Math.round(v.total / v.count) : 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      return { totalVehicles, totalShowrooms, topBrands };
    },
  });

  const maxCount = Math.max(1, ...(stats.data?.topBrands.map((b) => b.count) ?? [1]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Market Insights</div>
      <h1 className="mt-2 font-display text-4xl tracking-display">Live pulse of the Bazar360 marketplace</h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Active showrooms" value={stats.data?.totalShowrooms ?? "—"} />
        <Stat label="Total listings" value={stats.data?.totalVehicles ?? "—"} />
        <Stat label="Top brand" value={stats.data?.topBrands[0]?.brand ?? "—"} />
      </div>

      <section className="mt-12 surface-card p-6">
        <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Top brands by listings</div>
        <div className="mt-5 space-y-3">
          {stats.data?.topBrands.length === 0 && (
            <div className="text-sm text-muted-foreground">No data yet. Once dealerships start listing, trends appear here.</div>
          )}
          {stats.data?.topBrands.map((b) => (
            <div key={b.brand} className="flex items-center gap-4">
              <div className="w-32 text-sm">{b.brand}</div>
              <div className="flex-1 h-2 bg-surface rounded">
                <div className="h-full bg-primary rounded" style={{ width: `${(b.count / maxCount) * 100}%` }} />
              </div>
              <div className="w-16 text-right text-xs text-muted-foreground">{b.count}</div>
              <div className="w-32 text-right text-xs text-muted-foreground">{b.avg ? `PKR ${b.avg.toLocaleString()}` : "—"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="surface-card p-6">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl tracking-display">{value}</div>
    </div>
  );
}
