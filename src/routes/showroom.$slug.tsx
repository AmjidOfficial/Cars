import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleCard, type VehicleCardData } from "@/components/vehicle-card";
import { captureLead } from "@/lib/leads";
import { Phone, MessageCircle, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/showroom/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Showroom on Bazar360` },
      { name: "description", content: `Inventory, media, and contact for ${params.slug} on Bazar360.` },
      { property: "og:title", content: `${params.slug} — Bazar360` },
    ],
  }),
  component: ShowroomPage,
});

interface ThemeConfig {
  primary?: string;     // oklch string e.g. "0.65 0.18 25"
  accent?: string;
  background?: string;
}

function ShowroomPage() {
  const { slug } = Route.useParams();

  const showroom = useQuery({
    queryKey: ["showroom", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showrooms")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const inventory = useQuery({
    queryKey: ["showroom-inv", showroom.data?.id],
    enabled: !!showroom.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id,title,brand,model_year,mileage_km,fuel_type,price_pkr,price_formatted,images,is_premium,status")
        .eq("showroom_id", showroom.data!.id)
        .order("is_premium", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as VehicleCardData[];
    },
  });

  // Lead capture: log a profile view
  useEffect(() => {
    if (showroom.data?.id) {
      captureLead({ intent: "view_details", showroomId: showroom.data.id });
    }
  }, [showroom.data?.id]);

  const theme = (showroom.data?.theme_config as ThemeConfig | null) ?? {};
  const styleVars: React.CSSProperties = {};
  if (theme.primary) (styleVars as Record<string, string>)["--primary"] = `oklch(${theme.primary})`;
  if (theme.accent) (styleVars as Record<string, string>)["--accent"] = `oklch(${theme.accent})`;
  if (theme.background) (styleVars as Record<string, string>)["--background"] = `oklch(${theme.background})`;

  if (showroom.isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">Loading showroom…</div>;
  }
  if (!showroom.data) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">Showroom not found.</div>;
  }

  const s = showroom.data;

  return (
    <div style={styleVars} className="bg-background text-foreground">
      {/* Cover */}
      <section className="relative overflow-hidden border-b border-border">
        {s.cover_url && (
          <img src={s.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16">
          <div className="flex items-center gap-4">
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.name} className="h-16 w-16 rounded-md object-cover border border-border" />
            ) : (
              <div className="h-16 w-16 rounded-md bg-surface border border-border grid place-items-center text-primary font-display text-2xl">
                {s.name[0]}
              </div>
            )}
            <div>
              {s.is_flagship && (
                <div className="text-[10px] tracking-widest uppercase text-primary inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Flagship showroom
                </div>
              )}
              <h1 className="font-display text-4xl md:text-5xl tracking-display">{s.name}</h1>
              {s.tagline && <p className="mt-1 text-muted-foreground">{s.tagline}</p>}
              {s.city && (
                <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {s.city}
                </div>
              )}
            </div>
          </div>

          {s.description && (
            <p className="mt-8 max-w-2xl text-sm text-muted-foreground leading-relaxed">{s.description}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {s.call_number && (
              <a
                href={`tel:${s.call_number}`}
                onClick={() => captureLead({ intent: "callback", showroomId: s.id })}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Phone className="h-4 w-4" /> Call {s.call_number}
              </a>
            )}
            {s.whatsapp_number && (
              <a
                href={`https://wa.me/${s.whatsapp_number.replace(/\D/g, "")}`}
                target="_blank" rel="noreferrer"
                onClick={() => captureLead({ intent: "whatsapp", showroomId: s.id })}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="mx-auto max-w-7xl px-4 mt-16 pb-24">
        <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Inventory</div>
        <h2 className="mt-2 font-display text-3xl tracking-display">Currently on the floor</h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {inventory.isLoading &&
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="surface-card aspect-[4/5] animate-pulse" />)}
          {!inventory.isLoading && inventory.data?.length === 0 && (
            <div className="col-span-full surface-card p-12 text-center text-sm text-muted-foreground">
              No vehicles listed yet.
            </div>
          )}
          {inventory.data?.map((v) => (
            <VehicleCard key={v.id} vehicle={{ ...v, showroom: { name: s.name, slug: s.slug } }} />
          ))}
        </div>
      </section>
    </div>
  );
}
