import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleCard, type VehicleCardData } from "@/components/vehicle-card";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bazar360 — Premium Automotive Marketplace" },
      { name: "description", content: "Discover featured vehicles from elite dealerships across Pakistan, anchored by flagship showroom Auto Choice Peshawar." },
      { property: "og:title", content: "Bazar360 — Premium Automotive Marketplace" },
      { property: "og:description", content: "Featured fleet from elite dealerships." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id,title,brand,model_year,mileage_km,fuel_type,price_pkr,price_formatted,images,is_premium,status,showroom:showrooms(name,slug)")
        .order("is_premium", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as VehicleCardData[];
    },
  });

  const flagship = useQuery({
    queryKey: ["home-flagship"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showrooms")
        .select("name,slug,tagline,city,logo_url,cover_url")
        .eq("is_flagship", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="text-[11px] tracking-[0.35em] uppercase text-primary/80">
            Bazar360 · Automotive Ecosystem
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl sm:text-5xl md:text-6xl tracking-display leading-[1.05]">
            The marketplace where elite showrooms meet discerning buyers.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground">
            Browse the premium fleet, follow your favourite dealerships, and source rare vehicles with our concierge — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/inventory" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
              Browse inventory <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/concierge" className="inline-flex items-center gap-2 rounded-md border border-border bg-background/30 backdrop-blur px-5 py-3 text-sm font-medium hover:bg-accent">
              Concierge sourcing
            </Link>
          </div>
        </div>
      </section>

      {/* Flagship strip */}
      {flagship.data && (
        <section className="mx-auto max-w-7xl px-4 -mt-16 relative z-10">
          <Link
            to="/showroom/$slug"
            params={{ slug: flagship.data.slug }}
            className="surface-card p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 hover:border-primary/40 transition-colors bg-[image:var(--gradient-flagship)]/5"
          >
            <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Flagship Showroom
            </div>
            <div className="md:ml-auto">
              <div className="font-display text-2xl tracking-display">{flagship.data.name}</div>
              {flagship.data.tagline && (
                <div className="text-sm text-muted-foreground">{flagship.data.tagline}</div>
              )}
            </div>
            <div className="text-sm text-primary inline-flex items-center gap-1">
              Visit showroom <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </section>
      )}

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Featured fleet</div>
            <h2 className="mt-2 font-display text-3xl tracking-display">Hand-picked across the platform</h2>
          </div>
          <Link to="/inventory" className="text-sm text-primary inline-flex items-center gap-1 hover:opacity-80">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="surface-card aspect-[4/5] animate-pulse" />
            ))}
          {!featured.isLoading && featured.data?.length === 0 && (
            <div className="col-span-full surface-card p-12 text-center">
              <p className="text-muted-foreground text-sm">
                No vehicles published yet. Dealerships can sign in and start adding inventory from the Showroom Portal.
              </p>
              <Link to="/admin/showroom" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Open Showroom Portal
              </Link>
            </div>
          )}
          {featured.data?.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
