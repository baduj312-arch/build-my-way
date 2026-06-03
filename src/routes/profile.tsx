import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft, ChevronRight, Car, Wallet, Users, MapPin, ShieldCheck,
  CreditCard, Bell, LogOut, Phone, BadgeCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { driver } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Tireno" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell>
      <header className="relative overflow-hidden px-5 pb-6 pt-8">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="relative">
          <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated">
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <div className="mt-6 flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-emergency font-display text-2xl font-bold text-primary-foreground shadow-glow">
              {driver.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate font-display text-2xl font-bold">{driver.name}</h1>
                <BadgeCheck className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{driver.phone}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <StatusPill tone="success">Safety {driver.safetyScore}</StatusPill>
                <StatusPill tone="primary">Verified</StatusPill>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Wallet */}
      <section className="px-5">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Tireno Wallet</p>
              <p className="mt-2 font-display text-3xl font-bold">₵{driver.walletBalance.toFixed(2)}</p>
            </div>
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground">Top up</button>
            <button className="rounded-xl border border-border bg-surface-elevated py-2.5 text-xs font-semibold">History</button>
          </div>
        </div>
      </section>

      {/* Vehicle */}
      <section className="px-5 pt-5">
        <SectionTitle icon={Car} label="Primary vehicle" />
        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <p className="font-display text-lg font-bold">{driver.vehicle.make} {driver.vehicle.model}</p>
          <p className="text-xs text-muted-foreground">{driver.vehicle.color}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Info label="Plate" value={driver.vehicle.plate} />
            <Info label="Tyre" value={driver.vehicle.tyreSize} />
          </div>
        </div>
      </section>

      {/* Emergency contacts */}
      <section className="px-5 pt-5">
        <SectionTitle icon={Users} label="Emergency contacts" hint={`${driver.emergencyContacts.length}/5`} />
        <div className="mt-3 space-y-2">
          {driver.emergencyContacts.map((c) => (
            <div key={c.phone} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.relation} · {c.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saved locations */}
      <section className="px-5 pt-5">
        <SectionTitle icon={MapPin} label="Saved locations" />
        <div className="mt-3 space-y-2">
          {driver.savedLocations.map((l) => (
            <div key={l.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{l.label}</p>
                <p className="text-[11px] text-muted-foreground">{l.address}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section className="px-5 pt-5">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <MenuRow icon={ShieldCheck} label="Safety & privacy" />
          <MenuRow icon={CreditCard} label="Payment methods" hint="MTN · Card" />
          <MenuRow icon={Bell} label="Notifications" />
          <MenuRow icon={LogOut} label="Sign out" tone="destructive" />
        </div>
      </section>
    </AppShell>
  );
}

function SectionTitle({ icon: Icon, label, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-elevated p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function MenuRow({
  icon: Icon, label, hint, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  tone?: "destructive";
}) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left last:border-b-0">
      <Icon className={`h-4 w-4 ${tone === "destructive" ? "text-destructive" : "text-muted-foreground"}`} />
      <span className={`flex-1 text-sm font-medium ${tone === "destructive" ? "text-destructive" : ""}`}>{label}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
