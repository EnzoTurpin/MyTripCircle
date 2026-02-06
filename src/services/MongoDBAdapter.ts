// Adaptateur MongoDB pour remplacer DataService
import MongoDBService from "./MongoDBService";
import { Trip, Booking, Address, User } from "../types";
import bcrypt from "bcrypt";

class MongoDBAdapter {
  private static instance: MongoDBAdapter;
  private mongoService: MongoDBService;

  private constructor() {
    this.mongoService = MongoDBService.getInstance();
  }

  static getInstance(): MongoDBAdapter {
    if (!MongoDBAdapter.instance) {
      MongoDBAdapter.instance = new MongoDBAdapter();
    }
    return MongoDBAdapter.instance;
  }

  // Initialiser la connexion MongoDB
  async initialize(
    connectionString: string,
    dbName: string = "mytripcircle",
  ): Promise<void> {
    await this.mongoService.connect(connectionString, dbName);
  }

  // Trip Management
  async getTrips(): Promise<Trip[]> {
    try {
      // Pour l'instant, récupérer tous les trips (à adapter selon l'utilisateur connecté)
      const trips = await this.mongoService.searchTrips({});
      return trips.map(this.mapMongoTripToAppTrip);
    } catch (error) {
      console.error("Error getting trips:", error);
      return [];
    }
  }

  async createTrip(
    trip: Omit<Trip, "id" | "createdAt" | "updatedAt">,
  ): Promise<Trip> {
    try {
      const mongoTrip = await this.mongoService.createTrip({
        title: trip.title,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        destination: trip.destination,
        coverImage: trip.coverImage,
        ownerId: trip.ownerId,
        collaborators: trip.collaborators.map((id) => ({ userId: id })),
        isPublic: trip.isPublic,
      });
      return this.mapMongoTripToAppTrip(mongoTrip);
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  }

  async updateTrip(
    tripId: string,
    updates: Partial<Trip>,
  ): Promise<Trip | null> {
    try {
      const mongoUpdates: any = { ...updates };
      if (updates.collaborators) {
        mongoUpdates.collaborators = updates.collaborators.map((id) => ({
          userId: id,
        }));
      }

      const updatedTrip = await this.mongoService.updateTrip(
        tripId,
        mongoUpdates,
      );
      return updatedTrip ? this.mapMongoTripToAppTrip(updatedTrip) : null;
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  }

  async deleteTrip(tripId: string): Promise<boolean> {
    try {
      return await this.mongoService.deleteTrip(tripId);
    } catch (error) {
      console.error("Error deleting trip:", error);
      return false;
    }
  }

  async getTripById(tripId: string): Promise<Trip | null> {
    try {
      const trip = await this.mongoService.getTripById(tripId);
      return trip ? this.mapMongoTripToAppTrip(trip) : null;
    } catch (error) {
      console.error("Error getting trip by ID:", error);
      return null;
    }
  }

  // Booking Management
  async getBookings(): Promise<Booking[]> {
    try {
      const bookings = await this.mongoService.searchBookings({});
      return bookings.map(this.mapMongoBookingToAppBooking);
    } catch (error) {
      console.error("Error getting bookings:", error);
      return [];
    }
  }

  async createBooking(
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">,
  ): Promise<Booking> {
    try {
      const mongoBooking = await this.mongoService.createBooking({
        tripId: booking.tripId,
        type: booking.type,
        title: booking.title,
        description: booking.description,
        date: booking.date,
        endDate: booking.endDate,
        time: booking.time,
        address: booking.address,
        confirmationNumber: booking.confirmationNumber,
        price: booking.price,
        currency: booking.currency,
        status: booking.status,
        attachments: booking.attachments,
      });
      return this.mapMongoBookingToAppBooking(mongoBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  async updateBooking(
    bookingId: string,
    updates: Partial<Booking>,
  ): Promise<Booking | null> {
    try {
      const updatedBooking = await this.mongoService.updateBooking(
        bookingId,
        updates,
      );
      return updatedBooking
        ? this.mapMongoBookingToAppBooking(updatedBooking)
        : null;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  }

  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      return await this.mongoService.deleteBooking(bookingId);
    } catch (error) {
      console.error("Error deleting booking:", error);
      return false;
    }
  }

  async getBookingsByTripId(tripId: string): Promise<Booking[]> {
    try {
      const bookings = await this.mongoService.getBookingsByTripId(tripId);
      return bookings.map(this.mapMongoBookingToAppBooking);
    } catch (error) {
      console.error("Error getting bookings by trip ID:", error);
      return [];
    }
  }

  // Address Management
  async getAddresses(): Promise<Address[]> {
    try {
      const addresses = await this.mongoService.searchAddresses({});
      return addresses.map(this.mapMongoAddressToAppAddress);
    } catch (error) {
      console.error("Error getting addresses:", error);
      return [];
    }
  }

  async createAddress(
    address: Omit<Address, "id" | "createdAt" | "updatedAt">,
  ): Promise<Address> {
    try {
      const mongoAddress = await this.mongoService.createAddress({
        type: address.type,
        name: address.name,
        address: address.address,
        city: address.city,
        country: address.country,
        phone: address.phone,
        website: address.website,
        notes: address.notes,
      });
      return this.mapMongoAddressToAppAddress(mongoAddress);
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  async updateAddress(
    addressId: string,
    updates: Partial<Address>,
  ): Promise<Address | null> {
    try {
      const updatedAddress = await this.mongoService.updateAddress(
        addressId,
        updates,
      );
      return updatedAddress
        ? this.mapMongoAddressToAppAddress(updatedAddress)
        : null;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  async deleteAddress(addressId: string): Promise<boolean> {
    try {
      return await this.mongoService.deleteAddress(addressId);
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  }

  async getAddressesByTripId(tripId: string): Promise<Address[]> {
    try {
      const addresses = await this.mongoService.getAddressesByTripId(tripId);
      return addresses.map(this.mapMongoAddressToAppAddress);
    } catch (error) {
      console.error("Error getting addresses by trip ID:", error);
      return [];
    }
  }

  // User Management
  async getUsers(): Promise<User[]> {
    try {
      // Cette méthode devrait être adaptée selon les besoins
      return [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async createUser(user: {
    email: string;
    name: string;
    avatar?: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const created = await this.mongoService.createUser({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      password: hashedPassword,
      verified: false,
      otp,
      otpExpires,
    });

    return created;
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.mongoService.getUserById(userId);
      return user ? this.mapMongoUserToAppUser(user) : null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  // Mapping functions
  private mapMongoTripToAppTrip(mongoTrip: any): Trip {
    return {
      id: mongoTrip._id,
      title: mongoTrip.title,
      description: mongoTrip.description,
      startDate: mongoTrip.startDate,
      endDate: mongoTrip.endDate,
      destination: mongoTrip.destination,
      coverImage: mongoTrip.coverImage,
      ownerId: mongoTrip.ownerId.toString(),
      collaborators:
        mongoTrip.collaborators?.map((c: any) => ({
          userId: c.userId || c,
          role: c.role || "editor",
          joinedAt: c.joinedAt || new Date(),
          permissions: c.permissions || {
            canEdit: true,
            canInvite: false,
            canDelete: false,
          },
        })) || [],
      isPublic: mongoTrip.isPublic || false,
      visibility:
        mongoTrip.visibility || (mongoTrip.isPublic ? "public" : "private"),
      status: mongoTrip.status || "draft",
      stats: mongoTrip.stats || {
        totalBookings: 0,
        totalAddresses: 0,
        totalCollaborators: mongoTrip.collaborators?.length || 0,
      },
      location: mongoTrip.location || {
        type: "Point",
        coordinates: [0, 0],
      },
      tags: mongoTrip.tags || [],
      createdAt: mongoTrip.createdAt,
      updatedAt: mongoTrip.updatedAt,
    };
  }

  private mapMongoBookingToAppBooking(mongoBooking: any): Booking {
    return {
      id: mongoBooking._id,
      tripId: mongoBooking.tripId || "",
      type: mongoBooking.type,
      title: mongoBooking.title,
      description: mongoBooking.description,
      date: new Date(mongoBooking.date),
      endDate: mongoBooking.endDate
        ? new Date(mongoBooking.endDate)
        : undefined,
      time: mongoBooking.time,
      address: mongoBooking.address,
      confirmationNumber: mongoBooking.confirmationNumber,
      price: mongoBooking.price,
      currency: mongoBooking.currency || "EUR",
      status: mongoBooking.status || "pending",
      attachments: mongoBooking.attachments || [],
      createdAt: new Date(mongoBooking.createdAt),
      updatedAt: new Date(mongoBooking.updatedAt),
    };
  }

  private mapMongoAddressToAppAddress(mongoAddress: any): Address {
    return {
      id: mongoAddress._id,
      type: mongoAddress.type,
      name: mongoAddress.name,
      address: mongoAddress.address,
      city: mongoAddress.city,
      country: mongoAddress.country,
      phone: mongoAddress.phone,
      website: mongoAddress.website,
      notes: mongoAddress.notes,
      createdAt: mongoAddress.createdAt,
      updatedAt: mongoAddress.updatedAt,
    };
  }

  private mapMongoUserToAppUser(mongoUser: any): User {
    return {
      id: mongoUser._id,
      name: mongoUser.name,
      email: mongoUser.email,
      phone: mongoUser.phone,
      avatar: mongoUser.avatar,
      verified: mongoUser.verified || false,
      createdAt: mongoUser.createdAt,
    };
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    // Cette méthode devrait être adaptée selon les besoins
    console.warn("clearAllData not implemented for MongoDB");
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
      if (data.trips) {
        for (const trip of data.trips) {
          await this.createTrip(trip);
        }
      }
      if (data.bookings) {
        for (const booking of data.bookings) {
          await this.createBooking(booking);
        }
      }
      if (data.addresses) {
        for (const address of data.addresses) {
          await this.createAddress(address);
        }
      }
      if (data.users) {
        for (const user of data.users) {
          // createUser expects password, so we skip users without it
          if ("password" in user) {
            await this.createUser({
              email: user.email,
              name: user.name,
              avatar: user.avatar,
              password: "temp-password-change-me",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  }
}

export default MongoDBAdapter;
