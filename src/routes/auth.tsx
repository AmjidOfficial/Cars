import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInOrSignUpWithMobile } from "@/lib/auth";
import { toast } from "sonner";
import { Phone, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Bazar360" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInOrSignUpWithMobile(mobile, name || undefined);
      toast.success("Welcome to Bazar360");
      navigate({ to: "/admin/showroom" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-surface relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">B</div>
          <div className="font-display text-xl tracking-display">Bazar360</div>
        </Link>
        <div className="relative">
          <div className="text-[10px] tracking-widest uppercase text-primary">Premium ecosystem</div>
          <h2 className="mt-4 font-display text-4xl tracking-display leading-tight">
            One mobile number. Every dealership.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            No long sign-up. Enter your mobile number, get straight to managing your showroom or saving your favourite vehicles.
          </p>
        </div>
        <div className="text-xs text-muted-foreground tracking-wide">
          © {new Date().getFullYear()} Bazar360
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <Link to="/" className="lg:hidden mb-8 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">B</div>
            <div className="font-display text-xl tracking-display">Bazar360</div>
          </Link>

          <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Sign in</div>
          <h1 className="mt-2 font-display text-3xl tracking-display">Continue with mobile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            First time? We'll create your account automatically.
          </p>

          <label className="mt-8 block text-[10px] tracking-widest uppercase text-muted-foreground">Mobile number</label>
          <div className="mt-2 relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              required
              inputMode="tel"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <label className="mt-4 block text-[10px] tracking-widest uppercase text-muted-foreground">Display name (optional)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or business"
            className="mt-2 w-full bg-surface border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing you in…" : <>Continue <ArrowRight className="h-4 w-4" /></>}
          </button>

          <p className="mt-4 text-xs text-muted-foreground">
            By continuing you agree to Bazar360's terms. We never share your mobile.
          </p>
        </form>
      </div>
    </div>
  );
}
