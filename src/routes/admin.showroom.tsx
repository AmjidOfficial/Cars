import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Upload, LogOut, ExternalLink, ImagePlus } from "lucide-react";

export const Route = createFileRoute("/admin/showroom")({
  head: () => ({ meta: [{ title: "Showroom Portal — Bazar360" }] }),
  component: ShowroomAdmin,
});

async function compressImage(file: File, maxW = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });
  const ratio = Math.min(1, maxW / img.width);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b ?? file), "image/jpeg", quality)!);
}

async function uploadInventoryImages(files: FileList, userId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of Array.from(files)) {
    const blob = await compressImage(file);
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage.from("inventory-images").upload(path, blob, {
      contentType: "image/jpeg", cacheControl: "31536000",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("inventory-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

function ShowroomAdmin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const showrooms = useQuery({
    queryKey: ["my-showrooms", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showrooms")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && showrooms.data?.[0]) setSelectedId(showrooms.data[0].id);
  }, [showrooms.data, selectedId]);
  const selected = showrooms.data?.find((s) => s.id === selectedId);

  const inv = useQuery({
    queryKey: ["admin-inv", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("showroom_id", selectedId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const leads = useQuery({
    queryKey: ["admin-leads", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("target_showroom_id", selectedId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  if (loading || !user) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Showroom Portal</div>
          <h1 className="mt-2 font-display text-4xl tracking-display">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          {selected && (
            <Link
              to="/showroom/$slug"
              params={{ slug: selected.slug }}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:bg-accent"
            >
              View public page <ExternalLink className="h-3 w-3" />
            </Link>
          )}
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:bg-accent"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>

      {showrooms.isLoading ? (
        <div className="mt-12 text-muted-foreground text-sm">Loading…</div>
      ) : (showrooms.data?.length ?? 0) === 0 ? (
        <CreateShowroom userId={user.id} onCreated={() => qc.invalidateQueries({ queryKey: ["my-showrooms"] })} />
      ) : (
        <>
          {(showrooms.data?.length ?? 0) > 1 && (
            <div className="mt-6 flex gap-2 flex-wrap">
              {showrooms.data!.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`px-3 py-1.5 rounded-md text-xs border ${selectedId === s.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-10 grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-10">
                <AddInventoryForm
                  showroomId={selected.id}
                  userId={user.id}
                  onAdded={() => qc.invalidateQueries({ queryKey: ["admin-inv", selected.id] })}
                />

                <section>
                  <div className="flex items-end justify-between">
                    <h2 className="font-display text-2xl tracking-display">Inventory ({inv.data?.length ?? 0})</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {inv.data?.length === 0 && (
                      <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                        No vehicles yet. Add your first one above.
                      </div>
                    )}
                    {inv.data?.map((v) => (
                      <div key={v.id} className="surface-card p-4 flex items-center gap-4">
                        <div className="h-16 w-20 rounded-md bg-surface overflow-hidden flex-shrink-0">
                          {v.images?.[0] && <img src={v.images[0]} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{v.brand}</div>
                          <div className="font-medium truncate">{v.title}</div>
                          <div className="text-xs text-muted-foreground">{v.price_formatted || (v.price_pkr ? `PKR ${v.price_pkr.toLocaleString()}` : "POA")}</div>
                        </div>
                        <select
                          value={v.status}
                          onChange={async (e) => {
                            await supabase.from("inventory").update({ status: e.target.value as "available" | "reserved" | "sold" }).eq("id", v.id);
                            qc.invalidateQueries({ queryKey: ["admin-inv", selected.id] });
                          }}
                          className="bg-surface border border-border rounded-md px-2 py-1.5 text-xs"
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="sold">Sold</option>
                        </select>
                        <button
                          onClick={async () => {
                            if (!confirm("Delete this vehicle?")) return;
                            await supabase.from("inventory").delete().eq("id", v.id);
                            qc.invalidateQueries({ queryKey: ["admin-inv", selected.id] });
                            toast.success("Deleted");
                          }}
                          className="p-2 rounded-md hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside>
                <h2 className="font-display text-2xl tracking-display">Leads</h2>
                <p className="text-xs text-muted-foreground mt-1">Every call, WhatsApp click, and page view on your showroom.</p>
                <div className="mt-4 surface-card divide-y divide-border">
                  {leads.data?.length === 0 && (
                    <div className="p-6 text-sm text-muted-foreground text-center">No leads yet.</div>
                  )}
                  {leads.data?.map((l) => (
                    <div key={l.id} className="p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] tracking-widest uppercase text-primary">{l.intent}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(l.created_at).toLocaleString()}
                        </span>
                      </div>
                      {l.visitor_mobile && <div className="mt-1 font-medium">{l.visitor_mobile}</div>}
                      {l.notes && <div className="text-xs text-muted-foreground mt-1">{l.notes}</div>}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CreateShowroom({ userId, onCreated }: { userId: string; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [call, setCall] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const finalSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const { error } = await supabase.from("showrooms").insert({
      owner_id: userId,
      name, slug: finalSlug, city, tagline,
      whatsapp_number: whatsapp || null,
      call_number: call || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Showroom created");
    onCreated();
  }

  return (
    <form onSubmit={submit} className="mt-10 surface-card p-6 max-w-xl">
      <h2 className="font-display text-2xl tracking-display">Create your showroom</h2>
      <p className="text-sm text-muted-foreground mt-1">Get a public page in 30 seconds.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Field label="Showroom name *"><input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
        <Field label="URL slug"><input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-name" className={inputCls} /></Field>
        <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} /></Field>
        <Field label="Tagline"><input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} /></Field>
        <Field label="WhatsApp number"><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+92..." className={inputCls} /></Field>
        <Field label="Call number"><input value={call} onChange={(e) => setCall(e.target.value)} placeholder="+92..." className={inputCls} /></Field>
      </div>
      <button disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
        <Plus className="h-4 w-4" /> {saving ? "Creating…" : "Create showroom"}
      </button>
    </form>
  );
}

function AddInventoryForm({ showroomId, userId, onAdded }: { showroomId: string; userId: string; onAdded: () => void }) {
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState("");
  const [price, setPrice] = useState("");
  const [premium, setPremium] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        toast.info(`Uploading ${files.length} image(s)…`);
        imageUrls = await uploadInventoryImages(files, userId);
      }
      const priceNum = price ? Number(price.replace(/[^\d]/g, "")) : null;
      const { error } = await supabase.from("inventory").insert({
        showroom_id: showroomId,
        brand, title,
        model_year: year ? Number(year) : null,
        mileage_km: mileage ? Number(mileage) : null,
        fuel_type: fuel || null,
        price_pkr: priceNum,
        price_formatted: priceNum ? `PKR ${priceNum.toLocaleString()}` : null,
        images: imageUrls,
        is_premium: premium,
      });
      if (error) throw error;
      toast.success("Vehicle added");
      setBrand(""); setTitle(""); setYear(""); setMileage(""); setFuel(""); setPrice(""); setPremium(false); setFiles(null);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="surface-card p-6">
      <h2 className="font-display text-2xl tracking-display">Add a vehicle</h2>
      <p className="text-xs text-muted-foreground mt-1">Drag images in, fill the basics, publish.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Field label="Brand *"><input required value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Toyota" className={inputCls} /></Field>
        <Field label="Title *"><input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Land Cruiser ZX 2023" className={inputCls} /></Field>
        <Field label="Year"><input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} /></Field>
        <Field label="Mileage (km)"><input inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} className={inputCls} /></Field>
        <Field label="Fuel"><input value={fuel} onChange={(e) => setFuel(e.target.value)} placeholder="Petrol" className={inputCls} /></Field>
        <Field label="Price (PKR)"><input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="58000000" className={inputCls} /></Field>
      </div>

      <label className="mt-4 surface-card p-4 border-dashed flex items-center gap-3 cursor-pointer hover:border-primary/40">
        <ImagePlus className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-sm">{files?.length ? `${files.length} image(s) selected` : "Drag photos here or click to choose"}</div>
          <div className="text-xs text-muted-foreground">Auto-compressed before upload</div>
        </div>
        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setFiles(e.target.files)} />
      </label>

      <label className="mt-4 inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} />
        Mark as premium
      </label>

      <button disabled={busy} className="mt-4 ml-auto block inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
        <Upload className="h-4 w-4" /> {busy ? "Publishing…" : "Publish vehicle"}
      </button>
    </form>
  );
}

const inputCls = "w-full bg-surface border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
