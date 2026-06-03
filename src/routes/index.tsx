import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Siren, Wrench, Disc3, Truck, Fuel, BatteryCharging, Key,
  ShieldCheck, MapPin, ChevronRight, Star, Clock, Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { driver, providers, services } from "@/lib/mock-data";

const iconMap = { Wrench, Disc3, Truck, Fuel, BatteryCharging, Key } as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tireno — Roadside Assistance in seconds" },
      { name: "description", content: "One-tap SOS, live bidding from verified mechanics, vulcanizers, and tow trucks. Stay safe with Ride-or-Tow™." },
      { property: "og:title", content: "Tireno — Roadside Assistance in seconds" },
      { property: "og:description", content: "Verified providers, real-time bids, transparent pricing." },
    ],
  }),
  component: Home,
});

function Home() {
  const nearby = providers.slice(0, 3);
  return (
    <AppShell>
      {/* Header */}
      <header className="relative overflow-hidden bg-grid px-5 pb-8 pt-8">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emergency text-primary-foreground shadow-glow">
              <Siren className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tireno</p>
              <p className="text-sm font-semibold">Hello, {driver.name.split(" ")[0]}</p>
            </div>
          </div>
          <Link to="/profile" className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface-elevated text-sm font-semibold">
            {driver.initials}
          </Link>
        </div>

        <div className="relative mt-7">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Emergency ready</p>
          <h1 className="mt-2 text-4xl font-bold leading-[1.05] text-balance">
            Help is <span className="text-primary">90 seconds</span> away.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground text-balance">
            Tap SOS and verified providers near you will bid in real time.
          </p>
        </div>

        {/* SOS Button */}
        <Link to="/sos" className="mt-8 block">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="relative mx-auto grid h-44 w-44 place-items-center rounded-full bg-emergency text-primary-foreground animate-sos-pulse"
          >
            <div className="text-center">
              <Siren className="mx-auto h-10 w-10" strokeWidth={2.5} />
              <p className="mt-2 font-display text-2xl font-bold">SOS</p>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-80">One tap to send</p>
            </div>
          </motion.div>
        </Link>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Avg ETA", value: "6m" },
            { label: "Nearby", value: providers.length },
            { label: "Verified", value: "100%" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface-elevated/60 p-3">
              <p className="font-display text-lg font-bold">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Services */}
      <section className="px-5 pt-6">
        <SectionHeader title="What do you need?" hint="Tap to request" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {services.map((s) => {
            const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Wrench;
            return (
              <Link
                key={s.id}
                to="/sos"
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">from ₵{s.basePrice}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Ride-or-Tow Safety */}
      <section className="px-5 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-success/30 bg-gradient-to-br from-success/15 via-card to-card p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success/20 text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-success">
                Ride-or-Tow™ Safety
              </p>
              <h3 className="mt-1 font-display text-lg font-bold">Live trip sharing armed</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {driver.emergencyContacts.length} contacts will receive a tracker the moment you go SOS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby providers */}
      <section className="px-5 pt-6">
        <SectionHeader
          title="Verified near you"
          right={<Link to="/providers" className="text-xs font-medium text-primary inline-flex items-center gap-1">See all <ChevronRight className="h-3.5 w-3.5" /></Link>}
        />
        <div className="mt-4 space-y-3">
          {nearby.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emergency font-display text-sm font-bold text-primary-foreground">
                {p.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">{p.workshop}</p>
                  {p.verified && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{p.rating}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.distanceKm}km</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.etaMin}m</span>
                </div>
              </div>
              <StatusPill tone="primary">{p.type}</StatusPill>
            </div>
          ))}
        </div>
      </section>

      {/* Trust footer card */}
      <section className="px-5 pt-6">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Fake Mechanic Shield</p>
          </div>
          <h3 className="mt-2 font-display text-xl font-bold leading-tight text-balance">
            Every provider is ID-verified & re-checked every 6 months.
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Background checks, workshop photos, license validation — bid only from trusted hands.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function SectionHeader({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {right}
    </div>
  );
}
