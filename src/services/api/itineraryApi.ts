import { request } from "./apiCore";

export const itineraryApi = {
  generateItinerary: (data: { city: string; days: number }) =>
    request<{ cached: boolean; itinerary: any }>("/itinerary/generate", "POST", data),
};
