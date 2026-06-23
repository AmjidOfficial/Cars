import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Calendar, Sparkles } from "lucide-react";

export interface VehicleCardData {
  id: string;
  title: string;
  brand: string;
  model_year: number | null;
  mileage_km: number | null;
  fuel_type: string | null;
  price_formatted: string | null;
  price_pkr: number | null;
  images: string[];
  is_premium: boolean;
  status: "available" | "reserved" | "sold";
  showroom?: { name: string; slug: string } | null;
}

function formatPrice(v: VehicleCardData) {
  if (v.price_formatted) return v.price_formatted;
  if (v.price_pkr) return `PKR ${v.price_pkr.toLocaleString()}`;
  return "POA";
}

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const img = vehicle.images?.[0];
  return (
    <Link
      to="/showroom/$slug"
      params={{ slug: vehicle.showroom?.slug ?? "" }}
      className="group block surface-card overflow-hidden hover:border-primary/30 transition-colors"
    >
      <div className="aspect-[4/3] bg-surface relative overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={vehicle.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-muted-foreground text-xs tracking-widest uppercase">
            No image
          </div>
        )}
        {vehicle.is_premium && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="h-3 w-3" />
            Premium
          </div>
        )}
        {vehicle.status !== "available" && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur text-[10px] font-semibold tracking-widest uppercase">
            {vehicle.status}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
          {vehicle.brand}
        </div>
        <h3 className="mt-1 font-medium text-base leading-snug line-clamp-1">{vehicle.title}</h3>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {vehicle.model_year && (
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{vehicle.model_year}</span>
          )}
          {vehicle.mileage_km !== null && (
            <span className="inline-flex items-center gap-1"><Gauge className="h-3 w-3" />{vehicle.mileage_km.toLocaleString()} km</span>
          )}
          {vehicle.fuel_type && (
            <span className="inline-flex items-center gap-1"><Fuel className="h-3 w-3" />{vehicle.fuel_type}</span>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div className="font-display text-lg tracking-display">{formatPrice(vehicle)}</div>
          {vehicle.showroom && (
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
              {vehicle.showroom.name}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
