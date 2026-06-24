import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, BadgeCheck, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import { captureLead } from "@/lib/leads";
import { useEffect } from "react";

const FLAGSHIP_SLUG = "auto-choice-peshawar";

export const Route = createFileRoute("/auto-choice")({
  head: () => ({
    meta: [
      { title: "Auto Choice — Flagship Showroom · Bazar360" },
      { name: "description", content: "Auto Choice Peshawar — Pakistan's flagship premium showroom on Bazar360. Hand-picked inventory, verified seller, full-service buying experience." },
      { property: "og:title", content: "Auto Choice — Flagship Showroom · Bazar360" },
      { property: "og:description", content: "Pakistan's flagship premium showroom on Bazar360." },
    ],
  }),
  component: AutoChoicePage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-extrabold">Couldn't load Auto Choice</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-extrabold">Auto Choice isn't set up yet</h1>
      <p className="mt-2 text-sm text-muted-foreground">The flagship showroom hasn't been registered on Bazar360.</p>
      <Link to="/showrooms" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Browse all showrooms</Link>
    </div>
  ),
});

function AutoChoicePage() {
  const showroom = useQuery({
    queryKey: ["auto-choice-showroom"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showrooms")
        .select("*")
        .eq("slug", FLAGSHIP_SLUG)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const inventory = useQuery({
    queryKey: ["auto-choice-inventory", showroom.data?.id],
    enabled: !!showroom.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id,title,brand,model_year,mileage_km,price_pkr,price_formatted,images,is_premium,status")
        .eq("showroom_id", showroom.data!.id)
        .eq("status", "available")
        .order("is_premium", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(9);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (showroom.data?.id) captureLead({ intent: "view_details", showroomId: showroom.data.id });
  }, [showroom.data?.id]);

  if (showroom.isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">Loading Auto Choice…</div>;
  }
  const s = showroom.data!;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 hero-grid-bg" />
        {s.cover_url && (
          <img src={s.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.7_0.19_45_/_0.15),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Flagship Showroom
          </div>

          <div className="mt-6 flex items-start gap-5">
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.name} className="h-20 w-20 rounded-2xl object-cover border border-border shrink-0" />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-primary/15 text-primary border border-primary/30 grid place-items-center font-display font-extrabold text-2xl shrink-0">
                AC
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-display">
                {s.name}
              </h1>
              {s.tagline && <p className="mt-2 text-base text-muted-foreground">{s.tagline}</p>}
              {s.city && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" /> {s.city}
                </div>
              )}
            </div>
          </div>

          {s.description && (
            <p className="mt-8 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              {s.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {s.call_number && (
              <a
                href={`tel:${s.call_number}`}
                onClick={() => captureLead({ intent: "callback", showroomId: s.id })}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Phone className="h-4 w-4" /> Call {s.call_number}
              </a>
            )}
            {s.whatsapp_number && (
              <a
                href={`https://wa.me/${s.whatsapp_number.replace(/\D/g, "")}`}
                target="_blank" rel="noreferrer"
                onClick={() => captureLead({ intent: "whatsapp", showroomId: s.id })}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold hover:bg-surface"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp
              </a>
            )}
            <Link
              to="/showroom/$slug"
              params={{ slug: s.slug }}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold hover:bg-surface"
            >
              Full profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured fleet */}
      <section className="mx-auto max-w-7xl px-4 mt-16 pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-display">Currently on the floor</h2>
            <p className="mt-1 text-sm text-muted-foreground">Premium fleet, hand-picked by the Auto Choice team.</p>
          </div>
          <Link to="/showroom/$slug" params={{ slug: s.slug }} className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:opacity-80">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-card aspect-[4/5] animate-pulse" />
          ))}
          {!inventory.isLoading && (inventory.data?.length ?? 0) === 0 && (
            <div className="col-span-full surface-card p-12 text-center text-sm text-muted-foreground">
              No vehicles listed yet — check back soon.
            </div>
          )}
          {inventory.data?.map((v) => {
            const img = v.images?.[0];
            const price = v.price_formatted ?? (v.price_pkr ? `PKR ${v.price_pkr.toLocaleString()}` : "Price on Request");
            return (
              <Link
                key={v.id}
                to="/showroom/$slug"
                params={{ slug: s.slug }}
                className="surface-card overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
              >
                <div className="aspect-[16/10] bg-background relative overflow-hidden">
                  {img ? (
                    <img src={img} alt={v.title} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-muted-foreground text-xs">No image</div>
                  )}
                  {v.is_premium && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-base line-clamp-1">{v.title}</h3>
                  <div className="mt-2 font-display text-2xl font-extrabold text-primary">{price}</div>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2.5 py-1 rounded-full bg-background/60 border border-border text-muted-foreground">{s.city ?? "Peshawar"}</span>
                    {v.model_year && (
                      <span className="px-2.5 py-1 rounded-full bg-background/60 border border-border text-muted-foreground">{v.model_year}</span>
                    )}
                    {v.mileage_km != null && (
                      <span className="px-2.5 py-1 rounded-full bg-background/60 border border-border text-muted-foreground">{v.mileage_km.toLocaleString()} km</span>
                    )}
                  </div>
                  <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs text-emerald-400">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="font-medium">Auto Choice Showroom</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
