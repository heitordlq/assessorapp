import { useState, useEffect, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { usePermissions } from './usePermissions';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationError {
  code: number;
  message: string;
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const { requestPermission } = usePermissions();

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { granted } = await requestPermission(
        'android.permission.ACCESS_FINE_LOCATION'
      );

      if (!granted) {
        throw new Error('Permissão de localização negada');
      }

      Geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
          setLoading(false);
        },
        (error) => {
          setError({
            code: error.code,
            message: error.message,
          });
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (err) {
      setError({
        code: 1,
        message: err instanceof Error ? err.message : 'Erro ao obter localização',
      });
      setLoading(false);
    }
  }, [requestPermission]);

  const watchLocation = useCallback(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        setError({
          code: error.code,
          message: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    watchLocation,
  };
} 