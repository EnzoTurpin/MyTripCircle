import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Full EN/FR resources for current app
const resources = {
  en: {
    translation: {
      appName: "MyTripCircle",
      slogan: "Plan your perfect trip with friends",
      common: {
        email: "Email",
        password: "Password",
        fullName: "Full Name",
        signIn: "Sign In",
        signUp: "Sign Up",
        pleaseWait: "Please wait...",
        error: "Error",
        fillAllFields: "Please fill in all fields",
        unexpectedError: "An unexpected error occurred",
        loginFailed: "Login failed",
        registerFailed: "Registration failed",
        noAccount: "Don't have an account? Sign Up",
        haveAccount: "Already have an account? Sign In",
        ok: "OK",
        cancel: "Cancel",
        confirm: "Confirm",
        loading: "Loading...",
        add: "Add",
        create: "Create",
        edit: "Edit",
        logout: "Logout",
        settings: "Settings",
        helpSupport: "Help & Support",
        about: "About",
        user: "User",
      },
      tabs: {
        myTrips: "My Trips",
        bookings: "Bookings",
        addresses: "Addresses",
        profile: "Profile",
      },
      stack: {
        tripDetails: "Trip Details",
        bookingDetails: "Booking Details",
        addressDetails: "Address Details",
        inviteFriends: "Invite Friends",
      },
      trips: {
        header: "My Trips",
        loading: "Loading your trips...",
        emptyTitle: "No trips yet",
        emptySubtitle:
          "Create your first trip to start planning your adventure",
        createTrip: "Create Trip",
        membersSingular: "{{count}} member",
        membersPlural: "{{count}} members",
        createNewTripTitle: "Create New Trip",
        featureSoon: "This feature will be implemented soon!",
      },
      bookings: {
        header: "Bookings",
        loading: "Loading your bookings...",
        addBooking: "Add Booking",
        emptyTitle: "No bookings found",
        emptyAll: "Add your first booking to get started",
        emptyFiltered: "No {{type}} bookings found",
        filters: {
          all: "All",
          flight: "Flights",
          train: "Trains",
          hotel: "Hotels",
          restaurant: "Restaurants",
          activity: "Activities",
        },
        status: {
          confirmed: "Confirmed",
          pending: "Pending",
          cancelled: "Cancelled",
        },
        confirmationShort: "Conf: {{code}}",
      },
      addresses: {
        header: "Addresses",
        loading: "Loading your addresses...",
        addAddress: "Add Address",
        emptyTitle: "No addresses found",
        emptyAll: "Add your first address to get started",
        emptyFiltered: "No {{type}} addresses found",
        filters: {
          all: "All",
          hotel: "Hotels",
          restaurant: "Restaurants",
          activity: "Activities",
          transport: "Transport",
          other: "Other",
        },
        directionsTitle: "Directions",
        directionsOpening: "Opening directions to {{name}}",
      },
      tripDetails: {
        loading: "Loading trip details...",
        notFound: "Trip not found",
        inviteFriends: "Invite Friends",
        editTrip: "Edit Trip",
        bookings: "Bookings",
        addresses: "Addresses",
        noBookings: "No bookings yet",
        noAddresses: "No addresses yet",
        confirmation: "Confirmation: {{code}}",
        collaborators: "Collaborators",
        ownerYou: "You (Owner)",
        collaborator: "Collaborator {{index}}",
        featureSoon: "This feature will be implemented soon!",
      },
      profile: {
        logoutTitle: "Logout",
        logoutMessage: "Are you sure you want to logout?",
        editProfile: "Edit Profile",
        settings: "Settings",
        helpSupport: "Help & Support",
        about: "About",
        aboutTitle: "About MyTripCircle",
        aboutBody:
          "Version 1.0.0\n\nMyTripCircle helps you plan and organize your trips with friends. Create detailed itineraries, manage bookings, and collaborate with your travel companions.",
        userFallbackName: "User",
        userFallbackEmail: "user@example.com",
        stats: {
          trips: "Trips",
          bookings: "Bookings",
          addresses: "Addresses",
          friends: "Friends",
        },
        footerVersion: "MyTripCircle v1.0.0",
        footerMadeWithLove: "Made with ❤️ for travelers",
      },
    },
  },
  fr: {
    translation: {
      appName: "MyTripCircle",
      slogan: "Planifie le voyage parfait avec tes amis",
      common: {
        email: "E-mail",
        password: "Mot de passe",
        fullName: "Nom complet",
        signIn: "Se connecter",
        signUp: "Créer un compte",
        pleaseWait: "Veuillez patienter...",
        error: "Erreur",
        fillAllFields: "Veuillez renseigner tous les champs",
        unexpectedError: "Une erreur inattendue est survenue",
        loginFailed: "Échec de la connexion",
        registerFailed: "Échec de l'inscription",
        noAccount: "Pas de compte ? Créer un compte",
        haveAccount: "Déjà un compte ? Se connecter",
        ok: "OK",
        cancel: "Annuler",
        confirm: "Confirmer",
        loading: "Chargement...",
        add: "Ajouter",
        create: "Créer",
        edit: "Modifier",
        logout: "Se déconnecter",
        settings: "Paramètres",
        helpSupport: "Aide & support",
        about: "À propos",
        user: "Utilisateur",
      },
      tabs: {
        myTrips: "Mes voyages",
        bookings: "Réservations",
        addresses: "Adresses",
        profile: "Profil",
      },
      stack: {
        tripDetails: "Détails du voyage",
        bookingDetails: "Détails de la réservation",
        addressDetails: "Détails de l'adresse",
        inviteFriends: "Inviter des amis",
      },
      trips: {
        header: "Mes voyages",
        loading: "Chargement de vos voyages...",
        emptyTitle: "Aucun voyage",
        emptySubtitle: "Crée ton premier voyage pour commencer l'aventure",
        createTrip: "Créer un voyage",
        membersSingular: "{{count}} membre",
        membersPlural: "{{count}} membres",
        createNewTripTitle: "Créer un nouveau voyage",
        featureSoon: "Cette fonctionnalité arrive bientôt !",
      },
      bookings: {
        header: "Réservations",
        loading: "Chargement de vos réservations...",
        addBooking: "Ajouter une réservation",
        emptyTitle: "Aucune réservation",
        emptyAll: "Ajoute ta première réservation pour commencer",
        emptyFiltered: "Aucune réservation {{type}}",
        filters: {
          all: "Toutes",
          flight: "Vols",
          train: "Trains",
          hotel: "Hôtels",
          restaurant: "Restaurants",
          activity: "Activités",
        },
        status: {
          confirmed: "Confirmée",
          pending: "En attente",
          cancelled: "Annulée",
        },
        confirmationShort: "Conf : {{code}}",
      },
      addresses: {
        header: "Adresses",
        loading: "Chargement de vos adresses...",
        addAddress: "Ajouter une adresse",
        emptyTitle: "Aucune adresse",
        emptyAll: "Ajoute ta première adresse pour commencer",
        emptyFiltered: "Aucune adresse {{type}}",
        filters: {
          all: "Toutes",
          hotel: "Hôtels",
          restaurant: "Restaurants",
          activity: "Activités",
          transport: "Transport",
          other: "Autre",
        },
        directionsTitle: "Itinéraire",
        directionsOpening: "Ouverture de l'itinéraire vers {{name}}",
      },
      tripDetails: {
        loading: "Chargement des détails du voyage...",
        notFound: "Voyage introuvable",
        inviteFriends: "Inviter des amis",
        editTrip: "Modifier le voyage",
        bookings: "Réservations",
        addresses: "Adresses",
        noBookings: "Aucune réservation",
        noAddresses: "Aucune adresse",
        confirmation: "Confirmation : {{code}}",
        collaborators: "Collaborateurs",
        ownerYou: "Vous (propriétaire)",
        collaborator: "Collaborateur {{index}}",
        featureSoon: "Cette fonctionnalité arrive bientôt !",
      },
      profile: {
        logoutTitle: "Se déconnecter",
        logoutMessage: "Voulez-vous vraiment vous déconnecter ?",
        editProfile: "Modifier le profil",
        settings: "Paramètres",
        helpSupport: "Aide & support",
        about: "À propos",
        aboutTitle: "À propos de MyTripCircle",
        aboutBody:
          "Version 1.0.0\n\nMyTripCircle t'aide à planifier et organiser tes voyages entre amis. Crée des itinéraires détaillés, gère les réservations et collabore avec tes compagnons de voyage.",
        userFallbackName: "Utilisateur",
        userFallbackEmail: "utilisateur@exemple.com",
        stats: {
          trips: "Voyages",
          bookings: "Réservations",
          addresses: "Adresses",
          friends: "Amis",
        },
        footerVersion: "MyTripCircle v1.0.0",
        footerMadeWithLove: "Fait avec ❤️ pour les voyageurs",
      },
    },
  },
};

// Determine device language, fallback to 'en'
const deviceLocales = Localization.getLocales?.();
const deviceLanguage = (() => {
  if (Array.isArray(deviceLocales) && deviceLocales.length > 0) {
    const first = deviceLocales[0] as {
      languageCode?: string | null;
      languageTag?: string | null;
    };
    const fromCode = first.languageCode ?? undefined;
    const fromTag = first.languageTag
      ? first.languageTag.split("-")[0]
      : undefined;
    return fromCode || fromTag || "en";
  }
  return "en";
})();

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
