export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  verified?: boolean;
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
  invitedBy?: string; // ID de l'utilisateur qui a invité ce collaborateur
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
  userId?: string; // Lien avec l'utilisateur créateur
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
  tripId?: string; // Lien optionnel avec un voyage
  userId?: string; // Lien avec l'utilisateur créateur
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  respondedAt?: Date;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export interface TripInvitation {
  id: string;
  tripId: string;
  inviterId: string;
  inviteeEmail?: string;
  inviteePhone?: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expiresAt: Date;
  createdAt: Date;
  trip?: {
    _id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
  };
  inviter?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
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
  Otp: { userId: string };
  TripDetails: { tripId: string; showValidateButton?: boolean };
  BookingDetails: { bookingId: string };
  AddressDetails: { addressId: string };
  AddressForm: { addressId?: string } | undefined;
  InviteFriends: { tripId: string };
  Invitation: { token?: string };
  Friends: undefined;
  CreateTrip: undefined;
  EditTrip: { tripId: string };
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  ForgotPassword: { token?: string };
  HelpSupport: undefined;
  Subscription: undefined;
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
