import { useEffect, useRef, useState } from "react";

type LatLng = { lat: number; lng: number };

declare global {
  interface Window {
    google: any;
    __tirenoMapInit?: () => void;
    __tirenoMapReady?: boolean;
  }
}

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as
  | string
  | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as
  | string
  | undefined;

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

export function LiveMap({
  origin,
  destination,
  progress,
}: {
  origin: LatLng;
  destination: LatLng;
  // 0..1
  progress: number;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init
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
          center: origin,
          zoom: 14,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          backgroundColor: "#13131a",
          styles: darkStyle,
        });
        mapRef.current = map;

        lineRef.current = new g.maps.Polyline({
          path: [origin, destination],
          geodesic: true,
          strokeColor: "#e85d3a",
          strokeOpacity: 0,
          icons: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 1,
                strokeColor: "#e85d3a",
                strokeWeight: 3,
                scale: 3,
              },
              offset: "0",
              repeat: "14px",
            },
          ],
          map,
        });

        destMarkerRef.current = new g.maps.Marker({
          map,
          position: destination,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#22c55e",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });

        markerRef.current = new g.maps.Marker({
          map,
          position: origin,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#e85d3a",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });

        const bounds = new g.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(destination);
        map.fitBounds(bounds, 80);
        setReady(true);
      })
      .catch((e) => setError(e.message ?? "Map error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update animated marker as progress changes
  useEffect(() => {
    if (!ready || !markerRef.current) return;
    const t = Math.min(1, Math.max(0, progress));
    const lat = origin.lat + (destination.lat - origin.lat) * t;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    markerRef.current.setPosition({ lat, lng });
  }, [progress, ready, origin, destination]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapEl} className="h-full w-full" />
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center bg-surface text-xs text-muted-foreground">
          Loading live map…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-surface px-6 text-center text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}

// Compact dark style aligned with the app theme
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
