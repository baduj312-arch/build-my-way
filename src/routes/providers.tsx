import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ShieldCheck, Star, MapPin, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { providers } from "@/lib/mock-data";

const TYPES = ["All", "Mechanic", "Vulcanizer", "Tow Truck", "Battery", "Fuel"] as const;

export const Route = createFileRoute("/providers")({
  head: () => ({ meta: [{ title: "Nearby providers — Tireno" }] }),
  component: ProvidersPage,
});

function ProvidersPage() {
  const [filter, setFilter] = useState<(typeof TYPES)[number]>("All");
  const list = providers
    .filter((p) => filter === "All" || p.type === filter)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <AppShell>
      <header className="px-5 pb-2 pt-8">
        <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold leading-tight">Nearby providers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {list.length} verified within 5km — sorted by distance
        </p>
      </header>

      <div className="sticky top-0 z-10 -mx-px mt-4 overflow-x-auto bg-background/80 px-5 py-3 backdrop-blur">
        <div className="flex gap-2">
          {TYPES.map((t) => {
            const active = t === filter;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface-elevated text-muted-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-3 px-5 pt-2">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emergency font-display text-base font-bold text-primary-foreground">
                {p.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">{p.workshop}</p>
                  {p.verified && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
                </div>
                <p className="truncate text-xs text-muted-foreground">{p.name} · {p.type}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{p.rating} ({p.reviews})</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.distanceKm} km</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.etaMin} min</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-primary">{p.trustScore}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Trust</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <StatusPill tone="success">{p.successRate}% success</StatusPill>
              <Link
                to="/sos"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Request
              </Link>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
