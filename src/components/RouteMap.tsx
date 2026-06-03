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

export function loadMapsSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__tirenoMapReady && window.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("tireno-gmaps") as HTMLScriptElement | null;
    const ready = () => { window.__tirenoMapReady = true; resolve(); };
    if (existing) {
      if (window.google?.maps) ready();
      else existing.addEventListener("load", ready, { once: true });
      return;
    }
    window.__tirenoMapInit = ready;
    const s = document.createElement("script");
    s.id = "tireno-gmaps";
    s.async = true;
    s.defer = true;
    const params = new URLSearchParams({
      key: BROWSER_KEY ?? "",
      loading: "async",
      callback: "__tirenoMapInit",
      libraries: "geometry",
      ...(TRACKING_ID ? { channel: TRACKING_ID } : {}),
    });
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
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
];

export function RouteMap({
  origin,
  destination,
  livePosition,
  encodedPolyline,
}: {
  origin: LatLng;
  destination: LatLng;
  livePosition?: LatLng | null;
  encodedPolyline?: string | null;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const pathRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // init
  useEffect(() => {
    if (!BROWSER_KEY) { setError("Maps key missing"); return; }
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

        destMarkerRef.current = new g.maps.Marker({
          map, position: destination,
          icon: {
            path: g.maps.SymbolPath.CIRCLE, scale: 9,
            fillColor: "#22c55e", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3,
          },
        });
        markerRef.current = new g.maps.Marker({
          map, position: origin,
          icon: {
            path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6,
            fillColor: "#e85d3a", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2,
            rotation: 0,
          },
        });
        setReady(true);
      })
      .catch((e) => setError(e.message ?? "Map error"));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // draw polyline when encoded path changes
  useEffect(() => {
    if (!ready || !encodedPolyline) return;
    const g = window.google;
    const path = g.maps.geometry.encoding.decodePath(encodedPolyline);
    pathRef.current = path;
    if (lineRef.current) lineRef.current.setMap(null);
    lineRef.current = new g.maps.Polyline({
      path,
      strokeColor: "#e85d3a",
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map: mapRef.current,
    });
    const bounds = new g.maps.LatLngBounds();
    path.forEach((p: any) => bounds.extend(p));
    mapRef.current.fitBounds(bounds, 60);
  }, [ready, encodedPolyline]);

  // update marker when live position arrives (snap to nearest path point)
  useEffect(() => {
    if (!ready || !livePosition || !markerRef.current) return;
    const g = window.google;
    let target = livePosition;
    if (pathRef.current.length > 1 && g.maps.geometry?.spherical) {
      let best = pathRef.current[0];
      let bestDist = Infinity;
      const liveLL = new g.maps.LatLng(livePosition.lat, livePosition.lng);
      for (const p of pathRef.current) {
        const d = g.maps.geometry.spherical.computeDistanceBetween(liveLL, p);
        if (d < bestDist) { bestDist = d; best = p; }
      }
      target = { lat: best.lat(), lng: best.lng() };
    }
    markerRef.current.setPosition(target);
    mapRef.current?.panTo(target);
  }, [ready, livePosition]);

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
