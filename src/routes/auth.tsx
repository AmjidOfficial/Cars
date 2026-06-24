import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInOrSignUpWithMobile } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowRight, Facebook, Mail, X } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Bazar360" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInOrSignUpWithMobile(mobile);
      toast.success("Welcome to Bazar360");
      navigate({ to: "/admin/showroom" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in");
    } finally {
      setLoading(false);
    }
  }

  function notImplemented() {
    toast.info("Social login coming soon — use your mobile / email for now.");
  }

  return (
    <div className="min-h-screen relative grid place-items-center px-4 py-12 bg-background hero-grid-bg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.7_0.19_45_/_0.12),transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-md surface-card p-8 sm:p-10 shadow-2xl">
        <Link
          to="/"
          aria-label="Close"
          className="absolute right-4 top-4 h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
        >
          <X className="h-4 w-4" />
        </Link>

        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-extrabold">B</div>
          <div className="font-display text-lg font-extrabold tracking-display">Bazar360</div>
        </Link>

        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-display">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your listings and saved vehicles.</p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={notImplemented}
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-border bg-transparent px-4 py-3 text-sm font-medium hover:bg-surface-elevated"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <button
            type="button"
            onClick={notImplemented}
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-border bg-transparent px-4 py-3 text-sm font-medium hover:bg-surface-elevated"
          >
            <Facebook className="h-4 w-4 text-[#1877F2]" /> Continue with Facebook
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or sign in with email
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit}>
          <label className="block text-xs font-medium text-muted-foreground">Email or mobile</label>
          <div className="mt-1.5 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="you@example.com or +92 300 1234567"
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="block text-xs font-medium text-muted-foreground">Password</label>
            <button type="button" onClick={notImplemented} className="text-xs text-primary hover:underline">
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full bg-background border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : <>Sign In <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New to Bazar360? <Link to="/admin/showroom" className="text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.5-4.8 9.5-7.3 0-.5-.1-.9-.1-1.3H12z" />
    </svg>
  );
}
