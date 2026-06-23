import { Link } from "@tanstack/react-router";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/" as const, label: "Home" },
  { to: "/inventory" as const, label: "Inventory" },
  { to: "/media-feed" as const, label: "Media" },
  { to: "/market-insights" as const, label: "Insights" },
  { to: "/concierge" as const, label: "Concierge" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
      {/* Flagship bar — Auto Choice Peshawar */}
      <Link
        to="/showroom/$slug"
        params={{ slug: "auto-choice-peshawar" }}
        className="block w-full bg-[image:var(--gradient-flagship)] text-flagship-foreground"
      >
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Flagship Showroom · Auto Choice Peshawar — Premium Fleet</span>
        </div>
      </Link>

      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">
            B
          </div>
          <div className="leading-none">
            <div className="font-display text-lg tracking-display">Bazar360</div>
            <div className="text-[10px] tracking-widest text-muted-foreground uppercase">
              Automotive Marketplace
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="ml-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Sign in
          </Link>
        </nav>

        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95">
          <div className="px-4 py-3 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-muted-foreground"
                activeProps={{ className: "py-3 text-sm text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 text-sm font-medium rounded-md bg-primary text-primary-foreground text-center"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
