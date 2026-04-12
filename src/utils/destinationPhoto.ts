import { request } from "../services/api/apiCore";
import { API_BASE_URL } from "../config/api";

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
 * Retourne l'URL d'une photo via le proxy backend pour la destination donnée,
 * ou null si aucune photo n'est disponible / en cas d'erreur.
 * La clé Google Places n'est jamais exposée côté client.
 */
export async function fetchDestinationPhotoUrl(destination: string): Promise<string | null> {
  if (!destination.trim()) return null;

  try {
    const data = await request<{ results: any[] }>(
      `/places/textsearch?query=${encodeURIComponent(destination.trim())}&language=fr`
    );
    if (!data.results?.length) return null;

    const photoUrl: string | undefined = data.results[0]?.photoUrl;
    if (!photoUrl) return null;

    // photoUrl est déjà une URL proxifiée (/places/photo?ref=...) retournée par le backend
    return `${API_BASE_URL}${photoUrl}`;
  } catch {
    return null;
  }
}
