import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ChevronLeft, Radio } from "lucide-react";
import { toast } from "sonner";
import { getMyProvider } from "@/lib/providers.functions";
import { upsertMyLocation } from "@/lib/locations.functions";

export const Route = createFileRoute("/_authenticated/broadcast")({
  ssr: false,
  component: Broadcast,
});

function Broadcast() {
  const fetchMine = useServerFn(getMyProvider);
  const sendLoc = useServerFn(upsertMyLocation);
  const { data } = useQuery({ queryKey: ["my-provider"], queryFn: () => fetchMine() });
  const [online, setOnline] = useState(false);
  const [last, setLast] = useState<{ lat: number; lng: number; at: string } | null>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!online) {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      return;
    }
    if (!("geolocation" in navigator)) { toast.error("Geolocation not available"); setOnline(false); return; }
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        try {
          await sendLoc({ data: { lat, lng, heading: pos.coords.heading ?? null, speed: pos.coords.speed ?? null } });
          setLast({ lat, lng, at: new Date().toLocaleTimeString() });
        } catch (e) {
          toast.error((e as Error).message);
        }
      },
      (err) => toast.error(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current); };
  }, [online, sendLoc]);

  if (!data?.provider) {
    return (
      <AppShell>
        <div className="px-5 pt-6">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card"><ChevronLeft className="h-4 w-4" /></Link>
        </div>
        <div className="p-6 text-sm text-muted-foreground">
          No provider profile linked to your account. Ask an admin to link your account from the providers admin page.
        </div>
      </AppShell>
    );
  }

  const p = data.provider;
  return (
    <AppShell>
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card"><ChevronLeft className="h-4 w-4" /></Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Provider</p>
          <h1 className="font-display text-xl font-bold">{p.workshop}</h1>
        </div>
      </header>

      <div className="px-5 pt-6 space-y-4">
        <button
          onClick={() => setOnline((v) => !v)}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-5 font-display text-base font-bold ${
            online ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          <Radio className={`h-5 w-5 ${online ? "animate-pulse" : ""}`} />
          {online ? "Broadcasting live" : "Go online"}
        </button>

        <div className="rounded-2xl border border-border bg-card p-4 text-xs">
          <p className="font-semibold">Status</p>
          <p className="mt-1 text-muted-foreground">
            {online ? "Streaming GPS to dispatch every few seconds." : "Tap Go online to share your live location with drivers."}
          </p>
          {last && (
            <p className="mt-2 text-muted-foreground">
              Last ping: {last.lat.toFixed(5)}, {last.lng.toFixed(5)} at {last.at}
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
