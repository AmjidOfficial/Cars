import { Link } from "@tanstack/react-router";
import { Menu, Plus, User, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/" as const, label: "Home" },
  { to: "/showroom/$slug" as const, label: "Auto Choice", params: { slug: "auto-choice-peshawar" } },
  { to: "/inventory" as const, label: "Showrooms" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-extrabold text-lg">
            B
          </div>
          <div className="font-display text-xl font-extrabold tracking-display">Bazar360</div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              {...(item.params ? { params: item.params } : {})}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "px-4 py-2 text-sm font-medium text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-surface transition"
          >
            <User className="h-4 w-4" /> Login
          </Link>
          <Link
            to="/admin/showroom"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> Post Ad
          </Link>
        </div>

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
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                {...(item.params ? { params: item.params } : {})}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-muted-foreground"
                activeProps={{ className: "py-3 text-sm text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border border-border"
              >
                <User className="h-4 w-4" /> Login
              </Link>
              <Link
                to="/admin/showroom"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Post Ad
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
