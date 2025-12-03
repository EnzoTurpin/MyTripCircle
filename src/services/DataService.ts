import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trip, Booking, Address, User } from "../types";

class DataService {
  private static instance: DataService;
  private storageKeys = {
    trips: "mytripcircle_trips",
    bookings: "mytripcircle_bookings",
    addresses: "mytripcircle_addresses",
    users: "mytripcircle_users",
  };

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Trip Management
  async getTrips(): Promise<Trip[]> {
    try {
      const tripsData = await AsyncStorage.getItem(this.storageKeys.trips);
      if (tripsData) {
        const trips = JSON.parse(tripsData);
        // Convert date strings back to Date objects
        return trips.map((trip: any) => ({
          ...trip,
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          createdAt: new Date(trip.createdAt),
          updatedAt: new Date(trip.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting trips:", error);
      return [];
    }
  }

  async saveTrips(trips: Trip[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKeys.trips, JSON.stringify(trips));
    } catch (error) {
      console.error("Error saving trips:", error);
      throw error;
    }
  }

  async createTrip(
    trip: Omit<Trip, "id" | "createdAt" | "updatedAt">
  ): Promise<Trip> {
    try {
      const trips = await this.getTrips();
      const newTrip: Trip = {
        ...trip,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      trips.push(newTrip);
      await this.saveTrips(trips);
      return newTrip;
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  }

  async updateTrip(
    tripId: string,
    updates: Partial<Trip>
  ): Promise<Trip | null> {
    try {
      const trips = await this.getTrips();
      const tripIndex = trips.findIndex((trip) => trip.id === tripId);

      if (tripIndex === -1) {
        return null;
      }

      trips[tripIndex] = {
        ...trips[tripIndex],
        ...updates,
        updatedAt: new Date(),
      };

      await this.saveTrips(trips);
      return trips[tripIndex];
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  }

  async deleteTrip(tripId: string): Promise<boolean> {
    try {
      const trips = await this.getTrips();
      const filteredTrips = trips.filter((trip) => trip.id !== tripId);
      await this.saveTrips(filteredTrips);

      // Also delete related bookings and addresses
      await this.deleteBookingsByTripId(tripId);
      await this.deleteAddressesByTripId(tripId);

      return true;
    } catch (error) {
      console.error("Error deleting trip:", error);
      return false;
    }
  }

  async getTripById(tripId: string): Promise<Trip | null> {
    try {
      const trips = await this.getTrips();
      return trips.find((trip) => trip.id === tripId) || null;
    } catch (error) {
      console.error("Error getting trip by ID:", error);
      return null;
    }
  }

  // Booking Management
  async getBookings(): Promise<Booking[]> {
    try {
      const bookingsData = await AsyncStorage.getItem(
        this.storageKeys.bookings
      );
      if (bookingsData) {
        const bookings = JSON.parse(bookingsData);
        // Convert date strings back to Date objects
        return bookings.map((booking: any) => ({
          ...booking,
          date: new Date(booking.date),
          createdAt: new Date(booking.createdAt),
          updatedAt: new Date(booking.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting bookings:", error);
      return [];
    }
  }

  async saveBookings(bookings: Booking[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.storageKeys.bookings,
        JSON.stringify(bookings)
      );
    } catch (error) {
      console.error("Error saving bookings:", error);
      throw error;
    }
  }

  async createBooking(
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ): Promise<Booking> {
    try {
      const bookings = await this.getBookings();
      const newBooking: Booking = {
        ...booking,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      bookings.push(newBooking);
      await this.saveBookings(bookings);
      return newBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  async updateBooking(
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<Booking | null> {
    try {
      const bookings = await this.getBookings();
      const bookingIndex = bookings.findIndex(
        (booking) => booking.id === bookingId
      );

      if (bookingIndex === -1) {
        return null;
      }

      bookings[bookingIndex] = {
        ...bookings[bookingIndex],
        ...updates,
        updatedAt: new Date(),
      };

      await this.saveBookings(bookings);
      return bookings[bookingIndex];
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  }

  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      const bookings = await this.getBookings();
      const filteredBookings = bookings.filter(
        (booking) => booking.id !== bookingId
      );
      await this.saveBookings(filteredBookings);
      return true;
    } catch (error) {
      console.error("Error deleting booking:", error);
      return false;
    }
  }

  async getBookingsByTripId(tripId: string): Promise<Booking[]> {
    try {
      const bookings = await this.getBookings();
      return bookings.filter((booking) => booking.tripId === tripId);
    } catch (error) {
      console.error("Error getting bookings by trip ID:", error);
      return [];
    }
  }

  private async deleteBookingsByTripId(tripId: string): Promise<void> {
    try {
      const bookings = await this.getBookings();
      const filteredBookings = bookings.filter(
        (booking) => booking.tripId !== tripId
      );
      await this.saveBookings(filteredBookings);
    } catch (error) {
      console.error("Error deleting bookings by trip ID:", error);
    }
  }

  // Address Management
  async getAddresses(): Promise<Address[]> {
    try {
      const addressesData = await AsyncStorage.getItem(
        this.storageKeys.addresses
      );
      if (addressesData) {
        const addresses = JSON.parse(addressesData);
        // Convert date strings back to Date objects
        return addresses.map((address: any) => ({
          ...address,
          createdAt: new Date(address.createdAt),
          updatedAt: new Date(address.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting addresses:", error);
      return [];
    }
  }

  async saveAddresses(addresses: Address[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.storageKeys.addresses,
        JSON.stringify(addresses)
      );
    } catch (error) {
      console.error("Error saving addresses:", error);
      throw error;
    }
  }

  async createAddress(
    address: Omit<Address, "id" | "createdAt" | "updatedAt">
  ): Promise<Address> {
    try {
      const addresses = await this.getAddresses();
      const newAddress: Address = {
        ...address,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addresses.push(newAddress);
      await this.saveAddresses(addresses);
      return newAddress;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  async updateAddress(
    addressId: string,
    updates: Partial<Address>
  ): Promise<Address | null> {
    try {
      const addresses = await this.getAddresses();
      const addressIndex = addresses.findIndex(
        (address) => address.id === addressId
      );

      if (addressIndex === -1) {
        return null;
      }

      addresses[addressIndex] = {
        ...addresses[addressIndex],
        ...updates,
        updatedAt: new Date(),
      };

      await this.saveAddresses(addresses);
      return addresses[addressIndex];
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  async deleteAddress(addressId: string): Promise<boolean> {
    try {
      const addresses = await this.getAddresses();
      const filteredAddresses = addresses.filter(
        (address) => address.id !== addressId
      );
      await this.saveAddresses(filteredAddresses);
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  }

  async getAddressesByTripId(tripId: string): Promise<Address[]> {
    try {
      const addresses = await this.getAddresses();
      // Les adresses ne sont plus liées à un voyage spécifique
      return [];
    } catch (error) {
      console.error("Error getting addresses by trip ID:", error);
      return [];
    }
  }

  private async deleteAddressesByTripId(tripId: string): Promise<void> {
    try {
      const addresses = await this.getAddresses();
      // Les adresses ne sont plus liées à un voyage spécifique
      await this.saveAddresses(addresses);
    } catch (error) {
      console.error("Error deleting addresses by trip ID:", error);
    }
  }

  // User Management
  async getUsers(): Promise<User[]> {
    try {
      const usersData = await AsyncStorage.getItem(this.storageKeys.users);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async saveUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKeys.users, JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users:", error);
      throw error;
    }
  }

  async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    try {
      const users = await this.getUsers();
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      users.push(newUser);
      await this.saveUsers(users);
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find((user) => user.id === userId) || null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.storageKeys.trips,
        this.storageKeys.bookings,
        this.storageKeys.addresses,
        this.storageKeys.users,
      ]);
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }

  async exportData(): Promise<{
    trips: Trip[];
    bookings: Booking[];
    addresses: Address[];
    users: User[];
  }> {
    try {
      const [trips, bookings, addresses, users] = await Promise.all([
        this.getTrips(),
        this.getBookings(),
        this.getAddresses(),
        this.getUsers(),
      ]);

      return { trips, bookings, addresses, users };
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }

  async importData(data: {
    trips?: Trip[];
    bookings?: Booking[];
    addresses?: Address[];
    users?: User[];
  }): Promise<void> {
    try {
      if (data.trips) await this.saveTrips(data.trips);
      if (data.bookings) await this.saveBookings(data.bookings);
      if (data.addresses) await this.saveAddresses(data.addresses);
      if (data.users) await this.saveUsers(data.users);
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  }
}

export default DataService;
