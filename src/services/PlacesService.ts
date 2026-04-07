const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const GOOGLE_PLACES_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_PLACES_TEXT_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
const GOOGLE_PLACES_PHOTO_URL =
  "https://maps.googleapis.com/maps/api/place/photo";

const GOOGLE_PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "";

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

const buildError = (status: string, message?: string) => {
  const fallback = `Google Places error: ${status}`;
  return new Error(message || fallback);
};

export const hasGooglePlacesApiKey = GOOGLE_PLACES_API_KEY.length > 0;

const PLACE_TYPE_MAP: Record<string, string> = {
  hotel:      "lodging",
  restaurant: "restaurant",
  transport:  "transit_station",
  activity:   "tourist_attraction",
};

export const getAddressSuggestions = async (
  input: string,
  signal?: AbortSignal,
  location?: { lat: number; lng: number },
  addressType?: string
): Promise<AddressSuggestion[]> => {
  if (!hasGooglePlacesApiKey || !input.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    input,
    key: GOOGLE_PLACES_API_KEY,
    language: "fr",
  });

  if (location) {
    params.set("location", `${location.lat},${location.lng}`);
    params.set("radius", "50000");
  }

  const googleType = addressType ? PLACE_TYPE_MAP[addressType] : undefined;
  if (googleType) {
    params.set("types", googleType);
  }

  const response = await fetch(
    `${GOOGLE_PLACES_AUTOCOMPLETE_URL}?${params.toString()}`,
    { signal }
  );
  const data = await response.json();

  if (data.status === "ZERO_RESULTS") {
    return [];
  }

  if (data.status !== "OK") {
    throw buildError(data.status, data.error_message);
  }

  return (data.predictions || []).map((prediction: any) => ({
    placeId: prediction.place_id,
    description: prediction.description,
  }));
};

const extractComponent = (
  components: any[] = [],
  type: string
): string | undefined => {
  const component = components.find((item) => item.types?.includes(type));
  return component?.long_name;
};

export const getPlaceDetails = async (
  placeId: string
): Promise<PlaceDetailsResult> => {
  if (!hasGooglePlacesApiKey || !placeId) {
    return {};
  }

  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_PLACES_API_KEY,
    fields: "formatted_address,address_component,name,rating,formatted_phone_number,website,photos",
    language: "fr",
  });

  const response = await fetch(
    `${GOOGLE_PLACES_DETAILS_URL}?${params.toString()}`
  );
  const data = await response.json();

  if (data.status !== "OK") {
    throw buildError(data.status, data.error_message);
  }

  const components = data.result?.address_components || [];

  const city =
    extractComponent(components, "locality") ||
    extractComponent(components, "administrative_area_level_1");
  const country = extractComponent(components, "country");

  const rawRating = data.result?.rating;

  const firstPhotoRef = data.result?.photos?.[0]?.photo_reference;
  const photoUrl = firstPhotoRef
    ? `${GOOGLE_PLACES_PHOTO_URL}?maxwidth=800&photoreference=${firstPhotoRef}&key=${GOOGLE_PLACES_API_KEY}`
    : undefined;

  return {
    formattedAddress: data.result?.formatted_address,
    city:    city || undefined,
    country: country || undefined,
    name:    data.result?.name || undefined,
    phone:   data.result?.formatted_phone_number || undefined,
    website: data.result?.website || undefined,
    rating:  typeof rawRating === "number" ? rawRating : undefined,
    photoUrl,
  };
};

/**
 * Recherche un lieu par texte libre via l'API Google Places Text Search.
 * Retourne le premier résultat ou null si aucun résultat / clé absente.
 */
export const searchPlaceByText = async (
  query: string,
): Promise<TextSearchResult | null> => {
  if (!hasGooglePlacesApiKey || !query.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    query,
    key: GOOGLE_PLACES_API_KEY,
    language: "fr",
  });

  try {
    const response = await fetch(
      `${GOOGLE_PLACES_TEXT_SEARCH_URL}?${params.toString()}`,
    );
    const data = await response.json();

    if (data.status === "ZERO_RESULTS" || !data.results?.length) {
      return null;
    }

    if (data.status !== "OK") {
      return null;
    }

    const place = data.results[0];
    const photoRef = place.photos?.[0]?.photo_reference;
    const photoUrl = photoRef
      ? `${GOOGLE_PLACES_PHOTO_URL}?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`
      : undefined;

    return {
      placeId: place.place_id,
      name: place.name || "",
      formattedAddress: place.formatted_address || "",
      rating: typeof place.rating === "number" ? place.rating : undefined,
      photoUrl,
    };
  } catch {
    return null;
  }
};