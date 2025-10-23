export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  coverImage?: string;
  ownerId: string;
  collaborators: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  tripId: string;
  type: "flight" | "train" | "hotel" | "restaurant" | "activity";
  title: string;
  description?: string;
  date: Date;
  time?: string;
  address?: string;
  confirmationNumber?: string;
  price?: number;
  currency?: string;
  status: "confirmed" | "pending" | "cancelled";
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  tripId: string;
  type: "hotel" | "restaurant" | "activity" | "transport" | "other";
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  website?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripInvitation {
  id: string;
  tripId: string;
  inviterId: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface TripCollaborator {
  id: string;
  tripId: string;
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TripDetails: { tripId: string };
  BookingDetails: { bookingId: string };
  AddressDetails: { addressId: string };
  InviteFriends: { tripId: string };
  Profile: undefined;
};

export type MainTabParamList = {
  Trips: undefined;
  Bookings: undefined;
  Addresses: undefined;
  Profile: undefined;
};

// Navigation prop types
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: { params: RootStackParamList[T] };
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: any;
  route: { params: MainTabParamList[T] };
};
