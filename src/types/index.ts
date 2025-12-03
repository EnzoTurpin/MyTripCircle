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
  collaborators: Collaborator[];
  isPublic: boolean;
  visibility: "private" | "friends" | "public";
  status: "draft" | "validated";
  stats: TripStats;
  location: GeoLocation;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Collaborator {
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
  permissions: {
    canEdit: boolean;
    canInvite: boolean;
    canDelete: boolean;
  };
}

export interface TripStats {
  totalBookings: number;
  totalAddresses: number;
  totalCollaborators: number;
}

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Booking {
  id: string;
  tripId: string;
  type: "flight" | "train" | "hotel" | "restaurant" | "activity";
  title: string;
  description?: string;
  date: Date;
  endDate?: Date; // Date de fin (pour les hôtels par exemple)
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
  type: "hotel" | "restaurant" | "activity" | "transport" | "other";
  name: string;
  address: string;
  city: string;
  country: string;
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
  TripDetails: { tripId: string; showValidateButton?: boolean };
  BookingDetails: { bookingId: string };
  AddressDetails: { addressId: string };
  AddressForm: { addressId?: string } | undefined;
  InviteFriends: { tripId: string };
  Invitation: { token: string };
  CreateTrip: undefined;
  EditTrip: { tripId: string };
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
