const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";

// Cache en mémoire : destination (lowercase) → URL finale
const photoCache = new Map<string, string>();

/**
 * Comme fetchDestinationPhotoUrl mais utilise un cache en mémoire
 * pour éviter les appels répétés pour la même destination.
 */
export async function getCachedDestinationPhoto(destination: string): Promise<string | null> {
  const key = destination.trim().toLowerCase();
  if (photoCache.has(key)) return photoCache.get(key)!;
  const url = await fetchDestinationPhotoUrl(destination);
  if (url) photoCache.set(key, url);
  return url;
}

/**
 * Retourne l'URL d'une photo Google Places pour la destination donnée,
 * ou null si aucune photo n'est disponible / en cas d'erreur.
 */
export async function fetchDestinationPhotoUrl(destination: string): Promise<string | null> {
  if (!destination.trim() || !GOOGLE_API_KEY) return null;

  try {
    const query = encodeURIComponent(destination.trim());
    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${query}&key=${GOOGLE_API_KEY}`;

    const res = await fetch(searchUrl);
    if (!res.ok) return null;

    const data = await res.json();
    const photoRef: string | undefined = data?.results?.[0]?.photos?.[0]?.photo_reference;
    if (!photoRef) return null;

    // On suit la redirection 302 pour obtenir l'URL CDN finale (stable et directe)
    // plutôt que de stocker l'URL de redirection que React Native ne suit pas toujours
    const redirectUrl =
      `https://maps.googleapis.com/maps/api/place/photo` +
      `?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;

    const photoRes = await fetch(redirectUrl, { redirect: "follow" });
    if (!photoRes.ok) return null;

    // .url contient l'URL finale après redirection (URL CDN directe)
    return photoRes.url || redirectUrl;
  } catch {
    return null;
  }
}
