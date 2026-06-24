import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-surface/40 border-t border-border">
      {/* CTA card */}
      <div className="mx-auto max-w-7xl px-4 -mt-16">
        <div className="rounded-2xl bg-[image:var(--gradient-flagship)] p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-6 items-center shadow-2xl">
          <div>
            <h3 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground">Ready to Sell?</h3>
            <p className="mt-2 text-primary-foreground/90 text-sm md:text-base max-w-xl">
              Post your vehicle in minutes, or register your showroom and reach thousands of buyers across Pakistan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/showroom"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-lg bg-background text-foreground hover:opacity-90"
            >
              Post Free Ad
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-lg border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Register Showroom
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 grid gap-10 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-extrabold">B</div>
            <div className="font-display text-xl font-extrabold tracking-display">Bazar360</div>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Pakistan's smartest auto marketplace — verified showrooms, trusted sellers, all in one place.
          </p>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="h-9 w-9 grid place-items-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-foreground mb-4">Quick Links</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
            <li><Link to="/showroom/$slug" params={{ slug: "auto-choice-peshawar" }} className="text-muted-foreground hover:text-primary">Auto Choice</Link></li>
            <li><Link to="/inventory" className="text-muted-foreground hover:text-primary">Showrooms</Link></li>
            <li><Link to="/admin/showroom" className="text-muted-foreground hover:text-primary">Post Free Ad</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-foreground mb-4">Categories</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/inventory" className="text-muted-foreground hover:text-primary">Cars</Link></li>
            <li><Link to="/inventory" className="text-muted-foreground hover:text-primary">Motorcycles</Link></li>
            <li><Link to="/inventory" className="text-muted-foreground hover:text-primary">Trucks</Link></li>
            <li><Link to="/inventory" className="text-muted-foreground hover:text-primary">Auto Parts</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-foreground mb-4">Contact</div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Peshawar, Pakistan</li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" /> +92 300 0000000</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" /> hello@bazar360.online</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bazar360 — bazar360.online
      </div>
    </footer>
  );
}
