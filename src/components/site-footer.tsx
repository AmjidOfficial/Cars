import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-display text-xl tracking-display">Bazar360</div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            A premium multi-tenant automotive marketplace and dealership ecosystem.
          </p>
        </div>
        <div>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/inventory" className="hover:text-foreground text-muted-foreground">Inventory</Link></li>
            <li><Link to="/media-feed" className="hover:text-foreground text-muted-foreground">Media Feed</Link></li>
            <li><Link to="/market-insights" className="hover:text-foreground text-muted-foreground">Market Insights</Link></li>
            <li><Link to="/concierge" className="hover:text-foreground text-muted-foreground">Concierge</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3">Dealerships</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/admin/showroom" className="hover:text-foreground text-muted-foreground">Showroom Portal</Link></li>
            <li><Link to="/auth" className="hover:text-foreground text-muted-foreground">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground mb-3">Flagship</div>
          <Link to="/showroom/$slug" params={{ slug: "auto-choice-peshawar" }} className="text-sm text-foreground hover:text-primary">
            Auto Choice Peshawar →
          </Link>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground tracking-wide">
        © {new Date().getFullYear()} Bazar360. All rights reserved.
      </div>
    </footer>
  );
}
