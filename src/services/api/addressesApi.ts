import { request } from "./apiCore";

export const addressesApi = {
  getAddresses: () => request<any[]>("/addresses"),

  getAddressesByTripId: (tripId: string) => request<any[]>(`/addresses/trip/${tripId}`),

  getAddressById: (id: string) => request<any>(`/addresses/${id}`),

  createAddress: (address: {
    type: "hotel" | "restaurant" | "activity" | "transport" | "other";
    name: string;
    address: string;
    city: string;
    country: string;
    phone?: string;
    website?: string;
    notes?: string;
    rating?: number;
    tripId?: string;
  }) => request<any>("/addresses", "POST", address),

  updateAddress: (
    addressId: string,
    updates: {
      type?: "hotel" | "restaurant" | "activity" | "transport" | "other";
      name?: string;
      address?: string;
      city?: string;
      country?: string;
      phone?: string;
      website?: string;
      notes?: string;
      rating?: number;
    },
  ) => request<any>(`/addresses/${addressId}`, "PUT", updates),

  deleteAddress: (addressId: string) => request<any>(`/addresses/${addressId}`, "DELETE"),
};
