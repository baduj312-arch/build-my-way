import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Siren, MapPin, ShieldCheck, Star, Clock, X, Check, Radio,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { providers, services } from "@/lib/mock-data";

export const Route = createFileRoute("/sos")({
  head: () => ({ meta: [{ title: "Active SOS — Tireno" }] }),
  component: SosPage,
});

type Bid = {
  providerId: string;
  price: number;
  etaMin: number;
  receivedAt: number;
};

function SosPage() {
  const navigate = useNavigate();
  const [serviceId, setServiceId] = useState(services[0].id);
  const [phase, setPhase] = useState<"select" | "broadcasting" | "bidding">("select");
  const [bids, setBids] = useState<Bid[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const candidates = useMemo(() => providers.slice(0, 4), []);

  // Broadcast simulation
  useEffect(() => {
    if (phase !== "broadcasting") return;
    const t = setTimeout(() => setPhase("bidding"), 1600);
    return () => clearTimeout(t);
  }, [phase]);

  // Bid stream
  useEffect(() => {
    if (phase !== "bidding") return;
    const service = services.find((s) => s.id === serviceId)!;
    const timers = candidates.map((p, i) =>
      setTimeout(() => {
        setBids((prev) => [
          ...prev,
          {
            providerId: p.id,
            price: Math.round(service.basePrice * (0.9 + Math.random() * 0.5) + p.distanceKm * 8),
            etaMin: p.etaMin + Math.round(Math.random() * 3),
            receivedAt: Date.now(),
          },
        ]);
      }, 900 + i * 1400)
    );
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [phase, serviceId, candidates]);

  function startSOS() {
    setBids([]);
    setElapsed(0);
    setPhase("broadcasting");
  }

  function accept(bid: Bid) {
    navigate({
      to: "/track/$jobId",
      params: { jobId: "TRN-3471" },
      search: { p: bid.providerId, price: bid.price, eta: bid.etaMin },
    });
  }

  if (phase === "select") {
    return (
      <AppShell>
        <header className="px-5 pb-2 pt-8">
          <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated">
            <X className="h-4 w-4" />
          </Link>
          <h1 className="mt-6 font-display text-3xl font-bold leading-tight text-balance">
            What's the emergency?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We'll broadcast to the 4 closest verified providers.
          </p>
        </header>

        <section className="px-5 pt-6">
          <div className="grid grid-cols-2 gap-3">
            {services.map((s) => {
              const active = serviceId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="font-display text-base font-bold">{s.label}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{s.desc}</p>
                  <p className="mt-3 text-xs font-semibold text-primary">from ₵{s.basePrice}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Pickup location</p>
                <p className="text-sm font-semibold">East Legon, Lagos Ave (auto-GPS)</p>
              </div>
              <button className="text-xs font-semibold text-primary">Edit</button>
            </div>
          </div>

          <button
            onClick={startSOS}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emergency px-6 py-5 font-display text-lg font-bold text-primary-foreground shadow-glow active:scale-[0.98] transition-transform"
          >
            <Siren className="h-5 w-5" /> Broadcast SOS
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            By tapping, your live location is shared with selected providers and your emergency contacts.
          </p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="relative overflow-hidden bg-grid px-5 pb-6 pt-8">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/30 to-transparent" />
        <div className="relative">
          <StatusPill tone="primary">
            <Radio className="h-3 w-3 animate-pulse" /> Live SOS
          </StatusPill>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight">
            {phase === "broadcasting" ? "Reaching nearby providers…" : "Bids coming in"}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{elapsed}s elapsed</span>
            <span>·</span>
            <span>{bids.length} of {candidates.length} replied</span>
          </div>
        </div>

        {/* Radar */}
        <div className="relative mx-auto mt-8 grid h-48 w-48 place-items-center">
          <div className="absolute inset-0 rounded-full border border-primary/30" />
          <div className="absolute inset-6 rounded-full border border-primary/20" />
          <div className="absolute inset-12 rounded-full border border-primary/10" />
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping-slow" />
          <div className="relative grid h-16 w-16 place-items-center rounded-full bg-emergency text-primary-foreground shadow-glow">
            <Siren className="h-7 w-7" />
          </div>
          {candidates.map((p, i) => {
            const angle = (i / candidates.length) * Math.PI * 2;
            const r = 80;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const replied = bids.some((b) => b.providerId === p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                className={`absolute grid h-9 w-9 place-items-center rounded-full text-[10px] font-bold ring-2 ring-background ${
                  replied ? "bg-success text-success-foreground" : "bg-surface-elevated text-foreground"
                }`}
              >
                {replied ? <Check className="h-4 w-4" /> : p.avatar}
              </motion.div>
            );
          })}
        </div>
      </header>

      <section className="px-5 pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Incoming bids</p>
        <div className="mt-3 space-y-3">
          <AnimatePresence>
            {bids
              .slice()
              .sort((a, b) => a.price - b.price)
              .map((bid) => {
                const p = providers.find((x) => x.id === bid.providerId)!;
                return (
                  <motion.div
                    key={bid.providerId}
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-emergency font-display text-sm font-bold text-primary-foreground">
                        {p.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold">{p.workshop}</p>
                          {p.verified && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{p.rating} ({p.reviews})</span>
                          <span>Trust {p.trustScore}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold">₵{bid.price}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{bid.etaMin} min ETA</p>
                      </div>
                    </div>
                    <button
                      onClick={() => accept(bid)}
                      className="mt-3 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
                    >
                      Accept bid
                    </button>
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {bids.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-xs text-muted-foreground">
              Waiting for first bid…
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
