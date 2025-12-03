const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const GOOGLE_PLACES_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

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
}

const buildError = (status: string, message?: string) => {
  const fallback = `Google Places error: ${status}`;
  return new Error(message || fallback);
};

export const hasGooglePlacesApiKey = GOOGLE_PLACES_API_KEY.length > 0;

export const getAddressSuggestions = async (
  input: string,
  signal?: AbortSignal
): Promise<AddressSuggestion[]> => {
  if (!hasGooglePlacesApiKey || !input.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    input,
    key: GOOGLE_PLACES_API_KEY,
    types: "address",
    language: "fr",
  });

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
    fields: "formatted_address,address_component",
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

  return {
    formattedAddress: data.result?.formatted_address,
    city: city || undefined,
    country: country || undefined,
  };
};
