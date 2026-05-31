let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps only available in browser"));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.replace(
    /^["']|["']$/g,
    ""
  );
  if (!apiKey) {
    return Promise.reject(new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"));
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Google Maps script failed"))
      );
      if (window.google?.maps) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script failed"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          el: HTMLElement,
          opts: Record<string, unknown>
        ) => {
          setCenter: (pos: { lat: number; lng: number }) => void;
          fitBounds: (bounds: unknown, padding?: number) => void;
        };
        Marker: new (opts: Record<string, unknown>) => {
          setMap: (map: unknown | null) => void;
        };
        Circle: new (opts: Record<string, unknown>) => {
          setMap: (map: unknown | null) => void;
        };
        LatLngBounds: new () => {
          extend: (pos: { lat: number; lng: number }) => void;
        };
        SymbolPath: { CIRCLE: unknown };
      };
    };
  }
}
