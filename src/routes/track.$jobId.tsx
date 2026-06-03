import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, MessageCircle, ShieldCheck, Star, ChevronLeft, Share2, CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LiveMap } from "@/components/LiveMap";
import { StatusPill } from "@/components/StatusPill";
import { providers } from "@/lib/mock-data";

type Search = { p: string; price: number; eta: number };

export const Route = createFileRoute("/track/$jobId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    p: String(s.p ?? "p1"),
    price: Number(s.price ?? 80),
    eta: Number(s.eta ?? 8),
  }),
  head: () => ({ meta: [{ title: "Live tracking — Tireno" }] }),
  component: TrackPage,
});

const STAGES = ["Assigned", "En Route", "Arrived", "In Progress", "Completed"] as const;

function TrackPage() {
  const navigate = useNavigate();
  const { jobId } = Route.useParams();
  const { p, price, eta } = Route.useSearch();
  const provider = providers.find((x) => x.id === p) ?? providers[0];
  const [stageIdx, setStageIdx] = useState(1);
  const [etaLeft, setEtaLeft] = useState(eta);

  useEffect(() => {
    const t = setInterval(() => setEtaLeft((x: number) => Math.max(0, x - 1)), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (etaLeft === 0 && stageIdx < 2) setStageIdx(2);
  }, [etaLeft, stageIdx]);

  return (
    <AppShell>
      {/* Live map */}
      <div className="relative h-72 overflow-hidden bg-surface">
        <LiveMap
          origin={{ lat: 5.6502, lng: -0.1469 }}
          destination={{ lat: 5.6363, lng: -0.1739 }}
          progress={eta > 0 ? 1 - etaLeft / eta : 1}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Link to="/" className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 backdrop-blur">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <StatusPill tone="primary">Job #{jobId}</StatusPill>
        </div>
        <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 backdrop-blur">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <section className="px-5 pt-5">

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Arriving in</p>
            <p className="font-display text-4xl font-bold">
              {etaLeft}<span className="ml-1 text-base text-muted-foreground">min</span>
            </p>
          </div>
          <StatusPill tone="success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            10-min guarantee
          </StatusPill>
        </div>

        {/* Status tracker */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            {STAGES.map((s, i) => {
              const done = i <= stageIdx;
              return (
                <div key={s} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      done ? "bg-primary shadow-glow" : "bg-muted"
                    }`}
                  />
                  <p className={`text-[9px] font-semibold uppercase tracking-wider ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    {s}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="absolute inset-y-0 left-0 bg-emergency"
              animate={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {/* Provider card */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emergency font-display text-base font-bold text-primary-foreground">
              {provider.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold">{provider.name}</p>
                {provider.verified && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
              </div>
              <p className="truncate text-xs text-muted-foreground">{provider.workshop}</p>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{provider.rating}</span>
                <span>{provider.type}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated py-3 text-sm font-semibold">
              <Phone className="h-4 w-4 text-success" /> Call
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated py-3 text-sm font-semibold">
              <MessageCircle className="h-4 w-4 text-primary" /> Chat
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Numbers are masked for your safety
          </p>
        </div>

        {/* Fare summary */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Held in escrow</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold">₵{price}</p>
            <p className="text-xs text-muted-foreground">10% VODEC fee included</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Mobile Money · MTN</span>
            <span className="font-semibold text-success">Released on completion</span>
          </div>
        </div>

        {/* Safety */}
        <div className="mt-4 rounded-2xl border border-success/30 bg-success/5 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-success" />
            <div className="flex-1 text-xs">
              <p className="font-semibold">Live tracker shared with 3 contacts</p>
              <p className="text-muted-foreground">They'll be notified on arrival.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setStageIdx(STAGES.length - 1);
            setTimeout(
              () =>
                navigate({
                  to: "/rate/$jobId",
                  params: { jobId },
                  search: { p: provider.id, price },
                }),
              600
            );
          }}
          className="mt-4 mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-success px-6 py-4 font-display text-base font-bold text-success-foreground transition-transform active:scale-[0.98]"
        >
          <CheckCircle2 className="h-5 w-5" /> Mark job complete
        </button>
      </section>
    </AppShell>
  );
}
