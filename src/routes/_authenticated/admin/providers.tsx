import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ChevronLeft, Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  listAllProvidersAdmin,
  upsertProvider,
  deleteProvider,
  getMyRoles,
} from "@/lib/providers.functions";

export const Route = createFileRoute("/_authenticated/admin/providers")({
  ssr: false,
  beforeLoad: async () => {
    const { roles } = await getMyRoles();
    if (!roles.includes("admin")) throw redirect({ to: "/" });
  },
  component: AdminProviders,
});

type Form = {
  id?: string;
  name: string;
  workshop: string;
  type: "mechanic" | "vulcanizer" | "tow" | "battery" | "fuel";
  avatar: string;
  rating: number;
  verified: boolean;
  home_lat: number;
  home_lng: number;
  phone: string;
  active: boolean;
};

const blank: Form = {
  name: "", workshop: "", type: "mechanic", avatar: "", rating: 4.8,
  verified: false, home_lat: 5.6502, home_lng: -0.1469, phone: "", active: true,
};

function AdminProviders() {
  const fetchList = useServerFn(listAllProvidersAdmin);
  const fetchUpsert = useServerFn(upsertProvider);
  const fetchDelete = useServerFn(deleteProvider);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: () => fetchList(),
  });
  const upsertM = useMutation({
    mutationFn: (f: Form) => fetchUpsert({ data: f }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-providers"] }); toast.success("Saved"); setOpen(false); },
    onError: (e) => toast.error((e as Error).message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => fetchDelete({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-providers"] }); toast.success("Deleted"); },
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(blank);

  return (
    <AppShell>
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
            <h1 className="font-display text-xl font-bold">Providers</h1>
          </div>
        </div>
        <button
          onClick={() => { setForm(blank); setOpen(true); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </header>

      <div className="space-y-2 px-5 py-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {data?.providers.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emergency font-display text-sm font-bold text-primary-foreground">
              {p.avatar || p.name.slice(0,2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold">{p.workshop}</p>
                {p.verified && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
              </div>
              <p className="truncate text-[11px] text-muted-foreground">{p.name} · {p.type} · ★{p.rating}</p>
            </div>
            <button onClick={() => { setForm({ ...p } as Form); setOpen(true); }} className="grid h-9 w-9 place-items-center rounded-lg border border-border">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => confirm("Delete?") && delM.mutate(p.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {!isLoading && data?.providers.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No providers yet. Tap "New" to add one.
          </p>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-border bg-card">
          <SheetHeader><SheetTitle>{form.id ? "Edit provider" : "New provider"}</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-3 pb-6">
            <Field label="Workshop"><input className={inputCls} value={form.workshop} onChange={(e) => setForm({ ...form, workshop: e.target.value })} /></Field>
            <Field label="Contact name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Type">
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Form["type"] })}>
                <option value="mechanic">Mechanic</option>
                <option value="vulcanizer">Vulcanizer</option>
                <option value="tow">Tow Truck</option>
                <option value="battery">Battery</option>
                <option value="fuel">Fuel</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Avatar (2 ltr)"><input className={inputCls} maxLength={3} value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></Field>
              <Field label="Rating"><input className={inputCls} type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} /></Field>
            </div>
            <Field label="Phone"><input className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Home Lat"><input className={inputCls} type="number" step="0.0001" value={form.home_lat} onChange={(e) => setForm({ ...form, home_lat: +e.target.value })} /></Field>
              <Field label="Home Lng"><input className={inputCls} type="number" step="0.0001" value={form.home_lng} onChange={(e) => setForm({ ...form, home_lng: +e.target.value })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} /> Verified</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
            <button disabled={upsertM.isPending} onClick={() => upsertM.mutate(form)} className="w-full rounded-xl bg-primary py-3 font-display text-base font-bold text-primary-foreground disabled:opacity-50">
              {upsertM.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
