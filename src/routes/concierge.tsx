import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { captureLead } from "@/lib/leads";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const Route = createFileRoute("/concierge")({
  head: () => ({ meta: [{ title: "Concierge — Bazar360" }] }),
  component: Concierge,
});

function Concierge() {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mobile || !details) return;
    setBusy(true);
    await captureLead({
      intent: "concierge",
      visitorMobile: mobile,
      visitorName: name || null,
      notes: details,
    });
    setBusy(false);
    setSent(true);
    toast.success("Request submitted. We'll be in touch.");
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <div className="text-[10px] tracking-widest uppercase text-primary">Request received</div>
        <h1 className="mt-4 font-display text-4xl tracking-display">Our concierge will reach you shortly.</h1>
        <p className="mt-4 text-muted-foreground">We've forwarded your brief to vetted dealerships in our network.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Concierge</div>
      <h1 className="mt-2 font-display text-4xl tracking-display">Bespoke vehicle sourcing</h1>
      <p className="mt-4 text-muted-foreground max-w-lg">
        Tell us what you're after. Our team taps into the full Bazar360 dealer network — including rare imports — and gets back to you.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-4">
        <Field label="Your name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Mobile number *">
          <input required inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+92 300 1234567" className={inputCls} />
        </Field>
        <Field label="What are you looking for? *">
          <textarea required rows={5} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="2022 Toyota Land Cruiser ZX, white, max 50,000 km, budget ~60M PKR" className={inputCls} />
        </Field>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          <Send className="h-4 w-4" /> {busy ? "Sending…" : "Submit concierge request"}
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-surface border border-border rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
