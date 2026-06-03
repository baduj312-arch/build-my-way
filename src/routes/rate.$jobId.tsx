import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Check, PartyPopper } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { providers } from "@/lib/mock-data";

type Search = { p: string; price: number };

export const Route = createFileRoute("/rate/$jobId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    p: String(s.p ?? "p1"),
    price: Number(s.price ?? 80),
  }),
  head: () => ({ meta: [{ title: "Rate your provider — Tireno" }] }),
  component: RatePage,
});

const TAGS = ["On time", "Friendly", "Fair price", "Skilled", "Clean work", "Great gear"];
const TIPS = [0, 5, 10, 20];

function RatePage() {
  const navigate = useNavigate();
  const { jobId } = Route.useParams();
  const { p, price } = Route.useSearch();
  const provider = providers.find((x) => x.id === p) ?? providers[0];

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>(["On time", "Skilled"]);
  const [tip, setTip] = useState(10);
  const [submitted, setSubmitted] = useState(false);

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  function submit() {
    setSubmitted(true);
    setTimeout(() => navigate({ to: "/" }), 1800);
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="grid h-24 w-24 place-items-center rounded-full bg-success/20 text-success"
          >
            <PartyPopper className="h-10 w-10" />
          </motion.div>
          <h1 className="mt-6 font-display text-3xl font-bold">Thanks for the love</h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Your feedback keeps Tireno's network safe and verified.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="relative overflow-hidden px-5 pb-4 pt-8">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-success/20 to-transparent" />
        <div className="relative">
          <StatusPill tone="success">
            <Check className="h-3 w-3" /> Job #{jobId} completed
          </StatusPill>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-balance">
            How was {provider.name.split(" ")[0]}?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Honest reviews keep verified pros at the top.
          </p>
        </div>
      </header>

      <section className="px-5 pt-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emergency font-display text-base font-bold text-primary-foreground">
              {provider.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold">{provider.workshop}</p>
                {provider.verified && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
              </div>
              <p className="text-xs text-muted-foreground">{provider.type} · ₵{price} paid</p>
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => {
              const active = i <= (hover || rating);
              return (
                <button
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className="p-1"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      active ? "fill-warning text-warning" : "text-muted"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
          </p>
        </div>
      </section>

      <section className="px-5 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          What stood out?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TAGS.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface-elevated text-muted-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Add a tip
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {TIPS.map((t) => {
            const active = tip === t;
            return (
              <button
                key={t}
                onClick={() => setTip(t)}
                className={`rounded-2xl border py-3 text-center transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <p className="font-display text-base font-bold">{t === 0 ? "—" : `₵${t}`}</p>
                <p className="text-[10px] uppercase tracking-wider">
                  {t === 0 ? "No tip" : `${Math.round((t / price) * 100)}%`}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div>
            <p className="text-xs text-muted-foreground">Total charged</p>
            <p className="font-display text-2xl font-bold">₵{price + tip}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            ₵{price} fare {tip > 0 && <>+ ₵{tip} tip</>}
          </p>
        </div>

        <button
          onClick={submit}
          className="mt-4 w-full rounded-2xl bg-primary px-6 py-4 font-display text-base font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98]"
        >
          Submit review
        </button>
        <Link to="/" className="mt-3 block text-center text-xs text-muted-foreground">
          Skip for now
        </Link>
      </section>
    </AppShell>
  );
}
