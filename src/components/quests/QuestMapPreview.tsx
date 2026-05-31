"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { loadGoogleMapsScript } from "@/lib/google-maps-loader";
import type { QuestCheckpoint } from "@/lib/types";

interface QuestMapPreviewProps {
  checkpoints: QuestCheckpoint[];
  className?: string;
}

export default function QuestMapPreview({
  checkpoints,
  className = "h-44 w-full sm:h-52",
}: QuestMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!mapRef.current || checkpoints.length === 0) return;

    let cancelled = false;

    loadGoogleMapsScript()
      .then(() => {
        if (cancelled || !mapRef.current || !window.google) return;

        const bounds = new window.google.maps.LatLngBounds();
        checkpoints.forEach((cp) => bounds.extend({ lat: cp.lat, lng: cp.lng }));

        if (!mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            draggable: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            gestureHandling: "none",
            clickableIcons: false,
          });
        }

        mapInstance.current.fitBounds(bounds, 48);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [checkpoints]);

  useEffect(() => {
    if (!ready || !mapInstance.current || !window.google) return;

    const markers: { setMap: (map: unknown | null) => void }[] = [];

    checkpoints.forEach((cp, i) => {
      const marker = new window.google!.maps.Marker({
        position: { lat: cp.lat, lng: cp.lng },
        map: mapInstance.current,
        label: {
          text: String(i + 1),
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "600",
        },
        icon: {
          path: window.google!.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#f97316",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      markers.push(marker);
    });

    const bounds = new window.google.maps.LatLngBounds();
    checkpoints.forEach((cp) => bounds.extend({ lat: cp.lat, lng: cp.lng }));
    mapInstance.current.fitBounds(bounds, 48);

    return () => markers.forEach((m) => m.setMap(null));
  }, [ready, checkpoints]);

  if (failed || checkpoints.length === 0) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 via-stone-50 to-sky-50`}
      >
        <MapPin size={28} className="text-peach-muted" />
        <p className="text-xs text-ink-light">{checkpoints.length} точек маршрута</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
          <Loader2 size={22} className="animate-spin text-peach-muted" />
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
