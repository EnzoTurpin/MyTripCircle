import { API_URLS } from "../config/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

let workingUrl: string | null = null;

async function findWorkingUrl(): Promise<string> {
  if (workingUrl) return workingUrl;

  console.log("[ApiService] Starting to find working URL...");

  for (const url of API_URLS) {
    try {
      console.log(`[ApiService] Trying ${url}...`);
      const response = await fetch(`${url}/health`, {
        method: "GET",
      });
      if (response.ok) {
        workingUrl = url;
        console.log(`[ApiService] ✅ Success! Using URL: ${url}`);
        return url;
      } else {
        console.log(
          `[ApiService] ❌ ${url} returned status: ${response.status}`
        );
      }
    } catch (error) {
      console.log(
        `[ApiService] ❌ Failed to connect to ${url}: ${error.message}`
      );
    }
  }

  console.log("[ApiService] ❌ No working URL found!");
  throw new Error(
    "No working API URL found. Make sure the backend is running."
  );
}

async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: any
): Promise<T> {
  const baseUrl = await findWorkingUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const ApiService = {
  getTrips: () => request<any[]>("/trips"),
  getTripById: (id: string) => request<any>(`/trips/${id}`),
  getBookings: () => request<any[]>("/bookings"),
  getBookingsByTripId: (tripId: string) =>
    request<any[]>(`/bookings/trip/${tripId}`),
  getAddresses: () => request<any[]>("/addresses"),
  getAddressesByTripId: (tripId: string) =>
    request<any[]>(`/addresses/trip/${tripId}`),
};

export default ApiService;
