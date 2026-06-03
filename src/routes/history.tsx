import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Star, Receipt } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";
import { jobHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Service history — Tireno" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const total = jobHistory.filter((j) => j.status === "Completed").reduce((a, b) => a + b.amount, 0);
  return (
    <AppShell>
      <header className="px-5 pb-2 pt-8">
        <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold leading-tight">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">{jobHistory.length} jobs · ₵{total} lifetime</p>
      </header>

      <section className="px-5 pt-5">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary">This month</p>
          <p className="mt-2 font-display text-4xl font-bold">₵{total}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Across {jobHistory.length} requests — avg ₵{Math.round(total / jobHistory.length)} per service
          </p>
        </div>
      </section>

      <section className="space-y-3 px-5 pt-5">
        {jobHistory.map((j) => (
          <div key={j.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{j.service}</p>
                <p className="truncate text-xs text-muted-foreground">{j.provider}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{j.id} · {j.date}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold">₵{j.amount}</p>
                {j.rating && (
                  <div className="mt-0.5 inline-flex items-center gap-0.5 text-[11px]">
                    <Star className="h-3 w-3 fill-warning text-warning" />{j.rating}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3">
              <StatusPill
                tone={j.status === "Completed" ? "success" : j.status === "Cancelled" ? "warning" : "primary"}
              >
                {j.status}
              </StatusPill>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
