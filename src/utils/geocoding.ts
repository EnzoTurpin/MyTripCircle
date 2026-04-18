export interface GeoCoords {
  latitude: number;
  longitude: number;
}

// Cache mémoire — persiste pendant la session de l'app
const _cache = new Map<string, GeoCoords | null>();

const cacheKey = (address: string, city: string, country: string): string =>
  `${address}||${city}||${country}`.toLowerCase().trim();

/**
 * Vérifie le cache synchroniquement.
 * - undefined → non encore géocodé (requête réseau nécessaire)
 * - null → géocodage tenté mais sans résultat
 * - GeoCoords → coordonnées disponibles
 */
export const getCached = (
  address: string,
  city: string,
  country: string
): GeoCoords | null | undefined => {
  const key = cacheKey(address, city, country);
  return _cache.has(key) ? (_cache.get(key) ?? null) : undefined;
};

// Requête brute vers Nominatim (sans cache)
const _fetchNominatim = async (query: string): Promise<GeoCoords | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "MyTripCircle/1.0",
          "Accept-Language": "fr,en",
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return {
      latitude: Number.parseFloat(data[0].lat),
      longitude: Number.parseFloat(data[0].lon),
    };
  } catch (e) {
    if (__DEV__) console.warn("[geocoding] Erreur géocodage:", e);
    return null;
  }
};

/**
 * Géocode une adresse via Nominatim (OpenStreetMap).
 * Essaie d'abord l'adresse complète, puis se replie sur ville+pays.
 * Résultats mis en cache pour la session.
 * NOTE : Respecter la limite Nominatim côté appelant (max 1 req/s).
 * Cette fonction peut émettre 2 requêtes si la première échoue.
 */
export const geocodeAddress = async (
  address: string,
  city: string,
  country: string
): Promise<GeoCoords | null> => {
  const key = cacheKey(address, city, country);
  if (_cache.has(key)) return _cache.get(key) ?? null;

  // Essai 1 : adresse complète
  let coords = await _fetchNominatim(`${address}, ${city}, ${country}`);

  // Essai 2 : ville + pays seulement (plus tolérant avec Nominatim)
  if (!coords && city && country) {
    await new Promise<void>((r) => setTimeout(r, 1100));
    coords = await _fetchNominatim(`${city}, ${country}`);
  }

  _cache.set(key, coords);
  return coords;
};
