import { Trip, Booking, Address, TripInvitation } from "../types";
import { useTripsApiTrips } from "./useTripsApiTrips";
import { useTripsApiBookings } from "./useTripsApiBookings";
import { useTripsApiAddresses } from "./useTripsApiAddresses";
import { useTripsApiInvitations } from "./useTripsApiInvitations";

interface TripsApiSetters {
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  setInvitations: React.Dispatch<React.SetStateAction<TripInvitation[]>>;
  refreshData: () => Promise<void>;
}

export function useTripsApi(setters: TripsApiSetters) {
  const { setTrips, setBookings, setAddresses, setInvitations, refreshData } = setters;

  const trips       = useTripsApiTrips({ setTrips, setBookings });
  const bookings    = useTripsApiBookings({ setBookings });
  const addresses   = useTripsApiAddresses({ setAddresses });
  const invitations = useTripsApiInvitations({ setInvitations, refreshData });

  return {
    ...trips,
    ...bookings,
    ...addresses,
    ...invitations,
  };
}
