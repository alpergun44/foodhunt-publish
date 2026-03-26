/**
 * FoodHunt — Geolocation Hook (Web + Capacitor Native)
 *
 * On native iOS: uses Capacitor Geolocation plugin (faster, more accurate)
 * On web: uses browser Geolocation API
 * Falls back to Istanbul center if location unavailable.
 */
import { useState, useEffect, useCallback } from 'react';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface UseGeolocationResult {
  position: GeoPosition | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
  permissionDenied: boolean;
  refresh: () => void;
}

// Istanbul default fallback
const ISTANBUL_DEFAULT: GeoPosition = {
  lat: 41.0082,
  lng: 28.9784,
  accuracy: 50000,
};

/**
 * Detect if running inside Capacitor native shell
 */
function isNativePlatform(): boolean {
  try {
    // Capacitor sets window.Capacitor when running natively
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

/**
 * Get location using Capacitor Geolocation plugin (native iOS)
 */
async function getCapacitorLocation(): Promise<GeoPosition> {
  // Dynamic import — only loads on native
  const { Geolocation } = await import('@capacitor/geolocation');

  // Request permissions first on iOS
  const perm = await Geolocation.requestPermissions();
  if (perm.location === 'denied') {
    throw { code: 1, message: 'Konum izni reddedildi' };
  }

  const pos = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
  };
}

/**
 * Get location using browser Geolocation API (web)
 */
function getWebLocation(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 0, message: 'Tarayıcınız konum özelliğini desteklemiyor' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  });
}

export function useGeolocation(autoRequest = true): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const supported = typeof navigator !== 'undefined' && ('geolocation' in navigator || isNativePlatform());

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let pos: GeoPosition;

      if (isNativePlatform()) {
        // Use Capacitor native geolocation (faster, more accurate on iOS)
        pos = await getCapacitorLocation();
      } else {
        // Use browser geolocation
        pos = await getWebLocation();
      }

      setPosition(pos);
      setPermissionDenied(false);
    } catch (err: any) {
      const code = err?.code;
      if (code === 1) {
        setError('Konum izni reddedildi');
        setPermissionDenied(true);
      } else if (code === 2) {
        setError('Konum bilgisi mevcut degil');
      } else if (code === 3) {
        setError('Konum istegi zaman asimina ugradi');
      } else {
        setError(err?.message || 'Konum alinamadi');
      }
      // Fall back to Istanbul center
      setPosition(ISTANBUL_DEFAULT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  return {
    position,
    loading,
    error,
    supported,
    permissionDenied,
    refresh: requestLocation,
  };
}

export default useGeolocation;
