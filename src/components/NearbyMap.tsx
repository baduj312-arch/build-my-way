import { useEffect, useRef, useState } from "react";

type LatLng = { lat: number; lng: number };

declare global {
  interface Window {
    google: any;
    __tirenoMapInit?: () => void;
    __tirenoMapReady?: boolean;
  }
}

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

function loadMapsSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__tirenoMapReady && window.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("tireno-gmaps") as HTMLScriptElement | null;
    const handleReady = () => {
      window.__tirenoMapReady = true;
      resolve();
    };
    if (existing) {
      if (window.google?.maps) handleReady();
      else existing.addEventListener("load", handleReady, { once: true });
      return;
    }
    window.__tirenoMapInit = handleReady;
    const s = document.createElement("script");
    s.id = "tireno-gmaps";
    s.async = true;
    s.defer = true;
    const params = new URLSearchParams({
      key: BROWSER_KEY ?? "",
      loading: "async",
      callback: "__tirenoMapInit",
      ...(TRACKING_ID ? { channel: TRACKING_ID } : {}),
    });
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

export function NearbyMap({
  center,
  pins,
  onPinClick,
}: {
  center: LatLng;
  pins: { id: string; offsetKm: { x: number; y: number }; label: string }[];
  onPinClick?: (id: string) => void;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!BROWSER_KEY) {
      setError("Maps key missing");
      return;
    }
    let cancelled = false;
    loadMapsSdk()
      .then(() => {
        if (cancelled || !mapEl.current) return;
        const g = window.google;
        const map = new g.maps.Map(mapEl.current, {
          center,
          zoom: 14,
          disableDefaultUI: true,
          gestureHandling: "cooperative",
          keyboardShortcuts: false,
          clickableIcons: false,
          backgroundColor: "#13131a",
          styles: darkStyle,
        });

        new g.maps.Marker({
          map,
          position: center,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#e85d3a",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          zIndex: 999,
        });

        // 1 deg lat ≈ 111 km; lng scaled by cos(lat)
        const latPerKm = 1 / 111;
        const lngPerKm = 1 / (111 * Math.cos((center.lat * Math.PI) / 180));
        pins.forEach((p) => {
          const marker = new g.maps.Marker({
            map,
            position: {
              lat: center.lat + p.offsetKm.y * latPerKm,
              lng: center.lng + p.offsetKm.x * lngPerKm,
            },
            cursor: onPinClick ? "pointer" : "default",
            label: {
              text: p.label,
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "700",
            },
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 11,
              fillColor: "#22c55e",
              fillOpacity: 1,
              strokeColor: "#0f1620",
              strokeWeight: 2,
            },
          });
          if (onPinClick) {
            marker.addListener("click", () => onPinClick(p.id));
          }
        });

        setReady(true);
      })
      .catch((e) => setError(e.message ?? "Map error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapEl} className="h-full w-full" />
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center bg-surface text-[11px] text-muted-foreground">
          Locating you…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-surface text-[11px] text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}

export function useGeolocation(fallback: LatLng) {
  const [pos, setPos] = useState<LatLng>(fallback);
  const [state, setState] = useState<"idle" | "ok" | "denied" | "error">("idle");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setState("ok");
      },
      () => setState("denied"),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60_000 }
    );
  }, []);

  return { pos, state };
}

const darkStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a1a22" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a22" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a98" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a35" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3344" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1620" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a2a35" }] },
];
