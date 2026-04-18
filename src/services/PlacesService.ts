import { request } from "./api/apiCore";
import { API_BASE_URL } from "../config/api";

export interface AddressSuggestion {
  placeId: string;
  description: string;
}

export interface PlaceDetailsResult {
  formattedAddress?: string;
  city?: string;
  country?: string;
  name?: string;
  phone?: string;
  website?: string;
  rating?: number;
  photoUrl?: string;
}

export interface TextSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  rating?: number;
  photoUrl?: string;
}

// Indique si le proxy Places est disponible (toujours true — dépend du backend)
export const hasGooglePlacesApiKey = true;

const PLACE_TYPE_MAP: Record<string, string> = {
  hotel:         "lodging",
  restaurant:    "restaurant",
  transport:     "transit_station",
  activity:      "tourist_attraction",
  airport:       "airport",
  train_station: "train_station",
};

const extractComponent = (type: string, components: any[] = []): string | undefined => {
  const component = components.find((item) => item.types?.includes(type));
  return component?.long_name;
};

export const getAddressSuggestions = async (
  input: string,
  signal?: AbortSignal,
  location?: { lat: number; lng: number },
  addressType?: string,
): Promise<AddressSuggestion[]> => {
  if (!input.trim()) return [];

  const params = new URLSearchParams({ input: input.trim(), language: "fr" });
  if (location) {
    params.set("location", `${location.lat},${location.lng}`);
    params.set("radius", "50000");
  }
  const googleType = addressType ? PLACE_TYPE_MAP[addressType] : undefined;
  if (googleType) params.set("types", googleType);

  try {
    const data = await request<{ predictions: any[] }>(`/places/autocomplete?${params}`);
    return (data.predictions || []).map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
    }));
  } catch (e) {
    if (__DEV__) console.warn("[PlacesService] Erreur getAddressSuggestions:", e);
    return [];
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetailsResult> => {
  if (!placeId) return {};

  try {
    const data = await request<{ result: any }>(`/places/details?placeId=${encodeURIComponent(placeId)}&language=fr`);
    const result = data.result || {};
    const components = result.address_components || [];

    const city =
      extractComponent("locality", components) ||
      extractComponent("administrative_area_level_1", components);
    const country = extractComponent("country", components);

    // La photoUrl est déjà une URL proxifiée retournée par le backend (/places/photo?ref=...)
    const photoUrl = result.photoUrl ? `${API_BASE_URL}${result.photoUrl}` : undefined;

    return {
      formattedAddress: result.formatted_address,
      city:    city || undefined,
      country: country || undefined,
      name:    result.name || undefined,
      phone:   result.formatted_phone_number || undefined,
      website: result.website || undefined,
      rating:  typeof result.rating === "number" ? result.rating : undefined,
      photoUrl,
    };
  } catch (e) {
    if (__DEV__) console.warn("[PlacesService] Erreur getPlaceDetails:", e);
    return {};
  }
};

export const searchPlaceByText = async (query: string): Promise<TextSearchResult | null> => {
  if (!query.trim()) return null;

  try {
    const data = await request<{ results: any[] }>(`/places/textsearch?query=${encodeURIComponent(query)}&language=fr`);
    if (!data.results?.length) return null;

    const place = data.results[0];
    const photoUrl = place.photoUrl ? `${API_BASE_URL}${place.photoUrl}` : undefined;

    return {
      placeId: place.place_id,
      name: place.name || "",
      formattedAddress: place.formatted_address || "",
      rating: typeof place.rating === "number" ? place.rating : undefined,
      photoUrl,
    };
  } catch (e) {
    if (__DEV__) console.warn("[PlacesService] Erreur searchPlaceByText:", e);
    return null;
  }
};
