import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  ChevronRight,
  Bike,
  MapPin,
  MessageCircle,
  Search,
  Truck,
  Wrench,
  Zap,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bazar360 — Pakistan's Smartest Auto Marketplace" },
      { name: "description", content: "Discover thousands of verified listings from trusted showrooms and individual sellers — cars, bikes, trucks, and parts, all in one place." },
      { property: "og:title", content: "Bazar360 — Pakistan's Smartest Auto Marketplace" },
      { property: "og:description", content: "Verified listings from trusted showrooms across Pakistan." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <Hero />
      <StatsAndCategories />
      <FeaturedVehicles />
      <TrustedShowrooms />
      <HowItWorks />
    </div>
  );
}

/* -------------------- Hero -------------------- */
function Hero() {
  const [type, setType] = useState("");
  const [make, setMake] = useState("");
  const [city, setCity] = useState("");

  const liveCount = useQuery({
    queryKey: ["live-inventory-count"],
    queryFn: async () => {
      const { count } = await supabase.from("inventory").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.7_0.19_45_/_0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/60 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-muted-foreground">
            <span className="text-foreground font-semibold">{(liveCount.data ?? 47382).toLocaleString()}</span> active listings updated live
          </span>
        </div>

        <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-display">
          Pakistan's Smartest
          <br />
          <span className="text-primary">Auto Marketplace</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground">
          Discover thousands of verified listings from trusted showrooms and individual sellers — cars, bikes, trucks, and parts, all in one place.
        </p>

        {/* Search bar */}
        <div className="mt-10 max-w-4xl mx-auto rounded-2xl border border-border bg-surface/80 p-3 backdrop-blur shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <SearchSelect value={type} onChange={setType} placeholder="All Types" options={["All Types", "Cars", "Motorcycles", "Trucks", "Auto Parts"]} />
            <SearchSelect value={make} onChange={setMake} placeholder="Any Make" options={["Any Make", "Toyota", "Honda", "Suzuki", "Hyundai", "Kia", "BMW", "Mercedes"]} />
            <SearchSelect value={city} onChange={setCity} placeholder="Any City" options={["Any City", "Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Faisalabad"]} />
            <Link
              to="/inventory"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
          </div>
        </div>

        {/* Filter pills */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {["Cars Under PKR 20L", "Japanese Imports", "Low Mileage", "Auto Transmission", "Hybrid & EV"].map((p) => (
            <Link
              key={p}
              to="/inventory"
              className="px-4 py-2 text-xs font-medium rounded-full border border-border bg-surface/40 text-muted-foreground hover:text-primary hover:border-primary transition"
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SearchSelect({
  value, onChange, options, placeholder,
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* -------------------- Stats + Categories -------------------- */
function StatsAndCategories() {
  const stats = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const [inv, sh] = await Promise.all([
        supabase.from("inventory").select("*", { count: "exact", head: true }),
        supabase.from("showrooms").select("*", { count: "exact", head: true }),
      ]);
      return {
        listings: inv.count ?? 0,
        showrooms: sh.count ?? 0,
      };
    },
  });

  const items = [
    { value: stats.data?.listings ?? 47382, label: "Active Listings" },
    { value: stats.data?.showrooms ?? 1200, label: "Verified Sellers", suffix: "+" },
    { value: 85, label: "Cities Covered", suffix: "+" },
    { value: 50000, label: "Happy Customers", suffix: "+" },
  ];

  const categories = [
    { icon: Car, label: "Cars", count: "32,140 listings" },
    { icon: Bike, label: "Motorcycles", count: "8,920 listings" },
    { icon: Truck, label: "Trucks", count: "3,210 listings" },
    { icon: Wrench, label: "Auto Parts", count: "12,540 listings" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 mt-4 md:mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-10 border-y border-border">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl md:text-4xl font-extrabold text-primary">
              {s.value.toLocaleString()}{s.suffix ?? ""}
            </div>
            <div className="mt-1 text-xs md:text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-display text-center">
          Browse by Category
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center">Find exactly what you're looking for</p>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.label}
              to="/inventory"
              className="group surface-card aspect-square flex flex-col items-center justify-center text-center p-6 hover:border-primary transition"
            >
              <c.icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <div className="mt-4 font-display text-lg font-bold">{c.label}</div>
              <div className="mt-1 text-xs text-primary">{c.count}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- Featured Vehicles -------------------- */
function FeaturedVehicles() {
  const featured = useQuery({
    queryKey: ["home-featured-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("id,title,brand,model_year,mileage_km,fuel_type,price_pkr,price_formatted,images,is_premium,status,showroom:showrooms(name,slug,city)")
        .order("is_premium", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 mt-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-display">Featured Vehicles</h2>
          <p className="mt-1 text-sm text-muted-foreground">Hand-picked premium listings from across Pakistan</p>
        </div>
        <Link to="/inventory" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:opacity-80">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="surface-card aspect-[4/5] animate-pulse" />
        ))}
        {!featured.isLoading && (featured.data?.length ?? 0) === 0 && (
          <div className="col-span-full surface-card p-12 text-center text-sm text-muted-foreground">
            No featured vehicles yet. Sign in to your Showroom Portal to publish your first listing.
          </div>
        )}
        {featured.data?.map((v) => <FeaturedCard key={v.id} v={v as any} />)}
      </div>
    </section>
  );
}

function FeaturedCard({ v }: { v: {
  id: string; title: string; brand: string; model_year: number | null;
  mileage_km: number | null; price_pkr: number | null; price_formatted: string | null;
  images: string[]; is_premium: boolean;
  showroom: { name: string; slug: string; city: string | null } | null;
} }) {
  const img = v.images?.[0];
  const price = v.price_formatted ?? (v.price_pkr ? `PKR ${v.price_pkr.toLocaleString()}` : "Price on Request");
  const mileage = v.mileage_km != null ? `${v.mileage_km.toLocaleString()} km` : "—";
  return (
    <Link
      to="/showroom/$slug"
      params={{ slug: v.showroom?.slug ?? "" }}
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
        <h3 className="font-display font-bold text-base leading-snug line-clamp-1">{v.title}</h3>
        <div className="mt-2 font-display text-2xl font-extrabold text-primary">{price}</div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-background/60 border border-border text-muted-foreground">
            {v.showroom?.city ?? "Pakistan"}
          </span>
          {v.model_year && (
            <span className="px-2.5 py-1 rounded-full bg-background/60 border border-border text-muted-foreground">{v.model_year}</span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-background/60 border border-border text-muted-foreground">{mileage}</span>
        </div>
        <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs text-emerald-400">
          <BadgeCheck className="h-4 w-4" />
          <span className="font-medium">{v.showroom?.name ?? "Verified Seller"}</span>
        </div>
      </div>
    </Link>
  );
}

/* -------------------- Trusted Showrooms -------------------- */
function TrustedShowrooms() {
  const showrooms = useQuery({
    queryKey: ["home-showrooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showrooms")
        .select("id,name,slug,city,logo_url")
        .order("is_flagship", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 mt-20">
      <div className="text-center">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-display">Trusted Showrooms</h2>
        <p className="mt-2 text-sm text-muted-foreground">Browse inventory from verified dealerships across Pakistan</p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {showrooms.isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card h-56 animate-pulse" />
        ))}
        {showrooms.data?.map((s) => (
          <ShowroomCard key={s.id} s={s} />
        ))}
        {!showrooms.isLoading && (showrooms.data?.length ?? 0) === 0 && (
          <div className="col-span-full surface-card p-10 text-center text-sm text-muted-foreground">
            No showrooms registered yet.
          </div>
        )}
      </div>
    </section>
  );
}

function ShowroomCard({ s }: { s: { name: string; slug: string; city: string | null; logo_url: string | null } }) {
  const initials = useMemo(
    () => s.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    [s.name],
  );
  return (
    <div className="surface-card p-6 flex flex-col items-center text-center">
      {s.logo_url ? (
        <img src={s.logo_url} alt={s.name} className="h-16 w-16 rounded-full object-cover border border-border" />
      ) : (
        <div className="h-16 w-16 rounded-full bg-primary/15 text-primary border border-primary/30 grid place-items-center font-display font-bold text-lg">
          {initials || "S"}
        </div>
      )}
      <div className="mt-4 font-display font-bold text-base">{s.name}</div>
      <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" /> {s.city ?? "Pakistan"}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">142 listings</div>
      <Link
        to="/showroom/$slug"
        params={{ slug: s.slug }}
        className="mt-5 w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg border border-border text-primary hover:bg-primary hover:text-primary-foreground transition"
      >
        View Inventory
      </Link>
    </div>
  );
}

/* -------------------- How it works -------------------- */
function HowItWorks() {
  const steps = [
    { icon: UserPlus, title: "Create your account", desc: "Sign up in seconds with your mobile number." },
    { icon: Zap, title: "List your vehicle", desc: "Add photos, details and price — instant publish." },
    { icon: MessageCircle, title: "Get buyer requests", desc: "Chat with verified buyers, close the deal." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 mt-24">
      <div className="text-center">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-display">How It Works</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sell your vehicle in 3 simple steps</p>
      </div>

      <div className="mt-12 relative">
        <div className="hidden md:block absolute left-1/2 top-10 -translate-x-1/2 w-2/3 border-t border-dashed border-border" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center flex flex-col items-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-surface border border-border grid place-items-center">
                  <s.icon className="h-9 w-9 text-foreground" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold border-4 border-background">
                  {i + 1}
                </div>
              </div>
              <div className="mt-5 font-display font-bold text-lg">{s.title}</div>
              <div className="mt-2 text-sm text-muted-foreground max-w-xs">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <Link
          to="/admin/showroom"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
        >
          Get Started <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
