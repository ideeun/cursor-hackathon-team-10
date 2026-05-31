"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadGoogleMapsScript } from "@/lib/google-maps-loader";

interface QuestMapProps {
  lat: number;
  lng: number;
  userLat?: number | null;
  userLng?: number | null;
  radiusMeters?: number;
  className?: string;
}

export default function QuestMap({
  lat,
  lng,
  userLat,
  userLng,
  radiusMeters = 120,
  className = "h-56 w-full rounded-xl",
}: QuestMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleRef = useRef<any>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setMapsReady(true))
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapRef.current || !window.google) return;

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    circleRef.current?.setMap(null);

    const targetMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance.current,
      title: "Точка квеста",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#f97316",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });
    markersRef.current.push(targetMarker);

    circleRef.current = new window.google.maps.Circle({
      map: mapInstance.current,
      center: { lat, lng },
      radius: radiusMeters,
      fillColor: "#f97316",
      fillOpacity: 0.12,
      strokeColor: "#f97316",
      strokeOpacity: 0.5,
      strokeWeight: 1,
    });

    if (userLat != null && userLng != null) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: userLat, lng: userLng },
        map: mapInstance.current,
        title: "Вы здесь",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(userMarker);
    }

    mapInstance.current.setCenter({ lat, lng });
  }, [mapsReady, lat, lng, userLat, userLng, radiusMeters]);

  if (failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-stone-100 text-xs text-ink-light`}
      >
        Добавьте NEXT_PUBLIC_GOOGLE_MAPS_API_KEY в .env.local
      </div>
    );
  }

  return (
    <>
      {!mapsReady && (
        <div
          className={`${className} flex items-center justify-center bg-stone-50`}
        >
          <Loader2 size={20} className="animate-spin text-peach-muted" />
        </div>
      )}
      <div
        ref={mapRef}
        className={`${className} ${mapsReady ? "" : "hidden"}`}
      />
    </>
  );
}
