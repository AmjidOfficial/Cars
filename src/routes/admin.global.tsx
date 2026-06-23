import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/global")({
  head: () => ({ meta: [{ title: "Global Admin — Bazar360" }] }),
  component: GlobalAdmin,
});

function GlobalAdmin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [isSuper, setIsSuper] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      setIsSuper(!!data?.some((r) => r.role === "super_admin"));
      setChecked(true);
    });
  }, [user]);

  const leads = useQuery({
    queryKey: ["global-leads"],
    enabled: checked && isSuper,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, showroom:showrooms(name,slug)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const showrooms = useQuery({
    queryKey: ["global-showrooms"],
    enabled: checked && isSuper,
    queryFn: async () => {
      const { count } = await supabase.from("showrooms").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  if (loading || !user || !checked) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">Loading…</div>;
  }

  if (!isSuper) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <Shield className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="mt-6 font-display text-3xl tracking-display">Restricted area</h1>
        <p className="mt-4 text-muted-foreground">
          This dashboard is reserved for platform super-administrators. If you should have access, ask an existing super-admin to grant your account the <code className="text-primary">super_admin</code> role.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Master console</div>
      <h1 className="mt-2 font-display text-4xl tracking-display">Global admin</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Showrooms" value={showrooms.data ?? "—"} />
        <Stat label="Recent leads" value={leads.data?.length ?? "—"} />
        <Stat label="You" value={user.email ?? "Super admin"} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-display">All platform leads</h2>
        <div className="mt-4 surface-card divide-y divide-border">
          {leads.data?.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No leads yet.</div>}
          {leads.data?.map((l) => (
            <div key={l.id} className="p-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-[10px] tracking-widest uppercase text-primary w-28">{l.intent}</span>
              <span className="flex-1 min-w-[200px]">
                <div className="font-medium">{l.visitor_mobile || "Anonymous"}</div>
                {l.notes && <div className="text-xs text-muted-foreground truncate max-w-md">{l.notes}</div>}
              </span>
              <span className="text-xs text-muted-foreground">{l.showroom?.name ?? "—"}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="surface-card p-6">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl tracking-display truncate">{value}</div>
    </div>
  );
}
