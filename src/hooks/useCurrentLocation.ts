import { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface Coords {
  lat: number;
  lng: number;
}

export const useCurrentLocation = (): Coords | null => {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    })();
  }, []);

  return coords;
};
