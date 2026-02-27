import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Date formatting utilities
export const formatDate = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const currentLanguage = i18n.language;
    const locale = currentLanguage === "fr" ? "fr-FR" : "en-US";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    return dateObj.toLocaleDateString(locale, {
      ...defaultOptions,
      ...options,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const formatDateLong = (date: Date | string | null | undefined) => {
  return formatDate(date, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (time: string | null | undefined) => {
  if (!time) return "";

  try {
    const currentLanguage = i18n.language;
    const locale = currentLanguage === "fr" ? "fr-FR" : "en-US";

    // Parse time string (assuming HH:MM format)
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));

    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return time;
  }
};

// Function to change language programmatically
export const changeLanguage = (language: "en" | "fr") => {
  i18n.changeLanguage(language);
};

// Function to get current language
export const getCurrentLanguage = () => {
  return i18n.language;
};

// Helper function to get booking status translation
export const getBookingStatusTranslation = (status: string): string => {
  const statusKey = `bookings.status.${status}`;
  const translation = i18n.t(statusKey);
  // Si la traduction retourne la clé elle-même, c'est qu'elle n'existe pas
  if (translation === statusKey) {
    return status; // Retourner le statut tel quel en fallback
  }
  return translation;
};

// Helper function to parse API errors and return translated messages
export const parseApiError = (error: unknown): string => {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Try to parse as JSON
    let parsedError: any;
    try {
      parsedError = JSON.parse(errorMessage);
    } catch {
      // If not JSON, use the message as is
      parsedError = { error: errorMessage };
    }

    // Extract error message
    const apiError = parsedError.error || parsedError.message || errorMessage;

    // Map common API errors to translation keys
    if (apiError.includes("End date must be after start date")) {
      return i18n.t("createTrip.invalidDates");
    }

    // Return the error message if no translation found
    return apiError;
  } catch {
    // Fallback to generic error message
    return error instanceof Error
      ? error.message
      : i18n.t("common.error") || "An error occurred";
  }
};

// Test function to demonstrate date formatting
export const testDateFormatting = () => {
  const testDate = new Date("2024-03-15");
  const currentLang = getCurrentLanguage();

  console.log(`Current language: ${currentLang}`);
  console.log(`Short date: ${formatDate(testDate)}`);
  console.log(`Long date: ${formatDateLong(testDate)}`);
  console.log(`Time: ${formatTime("14:30")}`);

  return {
    language: currentLang,
    shortDate: formatDate(testDate),
    longDate: formatDateLong(testDate),
    time: formatTime("14:30"),
  };
};

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
        phone: "Phone number",
        signIn: "Sign In",
        signUp: "Sign Up",
        pleaseWait: "Please wait...",
        error: "Error",
        info: "Information",
        fillAllFields: "Please fill in all fields",
        unexpectedError: "An unexpected error occurred",
        loginFailed: "Login failed",
        registerFailed: "Registration failed",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        ok: "OK",
        cancel: "Cancel",
        validate: "Validate",
        confirm: "Confirm",
        loading: "Loading...",
        add: "Add",
        create: "Create",
        delete: "Delete",
        edit: "Edit",
        save: "Save",
        discard: "Discard",
        logout: "Logout",
        settings: "Settings",
        helpSupport: "Help & Support",
        about: "About",
        user: "User",
        unknown: "Unknown",
        welcomeBack: "Welcome back",
        createAccount: "Create account",
        loginToContinue: "Sign in to continue",
        signUpToStart: "Sign up to get started",
        forgotPassword: "Forgot password?",
        termsAgree: "By continuing, you agree to our",
        termsAndConditions: "Terms and Conditions",
        invalidEmail: "Please enter a valid email address",
        invalidPassword:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character.",
        passwordTooShort:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character.",
        invalidPhone: "Please enter a valid phone number",
        invalidCredentials: "Invalid email or password",
        emailAlreadyInUse: "This email is already in use",
        requiresOtp: "Please verify your account with the code sent to your email",
        requiresOtpExpired: "Your verification code expired. A new code has been sent to your email",
        confirmPassword: "Confirm Password",
        passwordsDoNotMatch: "Passwords do not match",
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
        members_one: "{{count}} Member",
        members_other: "{{count}} Members",
        createNewTripTitle: "Create New Trip",
        featureSoon: "This feature will be implemented soon!",
        apiTestSuccess: "API Test Success",
        apiTestFailed: "API Test Failed",
        apiTestError:
          "Could not connect to any API URL. Check if backend is running.",
      },
      bookings: {
        header: "Bookings",
        loading: "Loading your bookings...",
        addBooking: "Add Booking",
        selectOrCreate: "Select or create a booking",
        createNew: "Create a new booking",
        existingBookings: "Existing bookings",
        noExistingBookings: "No existing bookings",
        saveError: "Error saving booking",
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
        type: "Type",
        title: "Title",
        titlePlaceholder: "Enter booking title",
        date: "Date",
        startDate: "Start Date",
        endDate: "End Date",
        time: "Time",
        selectTime: "Select time",
        address: "Address",
        addressPlaceholder: "Enter address",
        description: "Description",
        descriptionPlaceholder: "Enter description",
        confirmationNumber: "Confirmation Number",
        confirmationNumberPlaceholder: "Enter confirmation number",
        price: "Price",
        currency: "Currency",
        statusLabel: "Status",
        editBooking: "Edit Booking",
        save: "Save",
        deleteConfirm: "Are you sure you want to delete this booking?",
        titleRequired: "Title is required",
        dateOutOfRange: "Booking date must be within the trip date range",
        selectTrip: "Select a trip",
        noTrips: "No trips available",
        noTripsMessage: "You must first create a trip to add a booking.",
        attachments: "Attachments",
        addImage: "Add Image",
        addDocument: "Add PDF",
        removeAttachmentConfirm: "Remove this file?",
        permissionDenied: "Gallery access permission denied",
        imagePickerError: "Error selecting image",
        documentPickerError: "Error selecting document",
        endDateBeforeStart: "End date must be after start date",
        details: {
          loading: "Loading booking details...",
          notFound: "Booking not found",
          description: "Description",
          location: "Location",
          getDirections: "Get Directions",
          bookingDetails: "Booking Details",
          confirmationNumber: "Confirmation Number:",
          price: "Price:",
          date: "Date:",
          time: "Time:",
          attachments: "Attachments",
          opening: "Opening",
          editBooking: "Edit Booking",
          cancelBooking: "Cancel Booking",
          cancelConfirm: "Are you sure you want to cancel this booking?",
          no: "No",
          yes: "Yes",
          viewAttachment: "View Attachment",
          featureSoon: "This feature will be implemented soon!",
        },
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
        featureSoon: "This feature will be implemented soon!",
        details: {
          loading: "Loading address details...",
          notFound: "Address not found",
          address: "Address",
          contactInformation: "Contact Information",
          notes: "Notes",
          coordinatesNotAvailable: "Coordinates not available for this address",
          getDirections: "Get Directions",
          editAddress: "Edit Address",
          featureSoon: "This feature will be implemented soon!",
          trip: "Trip",
        },
        form: {
          title: "Add Address",
          editTitle: "Edit Address",
          trip: "Trip",
          type: "Type",
          name: "Name",
          namePlaceholder: "Enter address name",
          address: "Address",
          addressPlaceholder: "Enter full address",
          city: "City",
          cityPlaceholder: "Enter city",
          country: "Country",
          countryPlaceholder: "Enter country",
          phone: "Phone",
          phonePlaceholder: "Add phone number",
          website: "Website",
          websitePlaceholder: "Add website URL",
          notes: "Notes",
          notesPlaceholder: "Add notes or instructions",
          coordinates: "Coordinates (optional)",
          latitude: "Latitude",
          longitude: "Longitude",
          coordinatesHint: "Use decimal degrees. Example: 48.8566 / 2.3522",
          requiredTrip: "Please select a trip for this address.",
          requiredFields: "Name, address, city and country are required.",
          invalidCoordinates:
            "Invalid coordinates. Please enter valid numbers.",
          submitError: "Unable to save this address. Please try again.",
          noTrips: "You need at least one trip before adding an address.",
        },
      },
      tripDetails: {
        loading: "Loading trip details...",
        notFound: "Trip not found",
        inviteFriends: "Invite Friends",
        editTrip: "Edit Trip",
        validateTrip: "Validate Trip",
        validateTripMessage:
          "Are you sure you want to validate this trip? This action cannot be undone.",
        tripValidated: "Trip Validated",
        tripValidatedMessage: "Your trip has been successfully validated!",
        bookings: "Bookings",
        addresses: "Addresses",
        noBookings: "No bookings yet",
        noAddresses: "No addresses yet",
        confirmation: "Confirmation: {{code}}",
        collaborators: "Collaborators",
        ownerYou: "You (Owner)",
        collaborator: "Collaborator {{index}}",
        featureSoon: "This feature will be implemented soon!",
        addBooking: "Add Booking",
        addAddress: "Add Address",
        draftMessage: "This trip is a draft. Validate it to make it active.",
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
        featureSoon: "This feature will be implemented soon!",
        invitations: "Invitations",
        invitationsMessage: "You have",
        noInvitations: "No pending invitations",
      },
      inviteFriends: {
        loading: "Loading friends...",
        header: "Invite Friends",
        subtitle: "Invite friends to collaborate on",
        inviteByEmail: "Invite by Email",
        enterEmail: "Enter email address",
        error: "Error",
        enterEmailError: "Please enter an email address",
        invitationSent: "Invitation Sent",
        invitationSentTo: "Invitation sent to",
        friends: "Friends",
        member: "Member",
        selectedFriends: "Selected Friends",
        sendInvitations: "Send Invitations",
        invitationsSent: "Invitations Sent",
        invitationsSentTo: "Invitations sent to",
        noFriendsSelected: "No Friends Selected",
        selectFriendsToInvite: "Please select friends to invite",
        invitationMessage: "You've been invited to collaborate on",
        invitationError: "Failed to send invitation",
        loadingError: "Failed to load data",
        userNotFound: "User not found",
        sendingInvitations: "Sending invitations...",
      },
      invitation: {
        title: "Trip Invitation",
        loading: "Loading invitation...",
        notFound: "Invitation Not Found",
        notFoundMessage: "This invitation link is invalid or has expired.",
        invitationTitle: "You've been invited to collaborate on",
        sentTo: "Sent to",
        sentOn: "Sent on",
        expiresOn: "Expires on",
        expired: "This invitation has expired",
        accept: "Accept",
        decline: "Decline",
        accepted: "Invitation Accepted",
        acceptedMessage: "You are now a collaborator on this trip!",
        declined: "Invitation Declined",
        declinedMessage: "You have declined this invitation.",
        declineTitle: "Decline Invitation",
        declineMessage: "Are you sure you want to decline this invitation?",
        statusAccepted: "Accepted",
        statusDeclined: "Declined",
        processing: "Processing...",
        acceptError: "Failed to accept invitation",
        declineError: "Failed to decline invitation",
        loadingError: "Failed to load invitation",
      },
      createTrip: {
        title: "Create Trip",
        tripTitle: "Trip Title",
        tripTitlePlaceholder: "Enter trip title",
        destination: "Destination",
        destinationPlaceholder: "Enter destination",
        startDate: "Start Date",
        endDate: "End Date",
        description: "Description",
        descriptionPlaceholder: "Tell us about your trip...",
        visibility: "Visibility",
        public: "Public",
        private: "Private",
        friends: "Friends",
        publicDescription: "Anyone can see this trip",
        privateDescription: "Only you and collaborators can see this trip",
        tags: "Tags",
        addTag: "Add tag",
        createTrip: "Create Trip",
        creating: "Creating...",
        success: "Trip Created",
        successMessage: "Your trip has been created successfully!",
        error: "Error",
        titleRequired: "Trip title is required",
        destinationRequired: "Destination is required",
        invalidDates: "End date must be after start date",
        startDatePast: "Start date cannot be in the past",
        errorMessage: "Failed to create trip",
        cancelTitle: "Cancel Creation",
        cancelMessage:
          "Are you sure you want to cancel? All changes will be lost.",
      },
      editTrip: {
        title: "Edit Trip",
        loading: "Loading trip...",
        updateTrip: "Update Trip",
        updating: "Updating...",
        success: "Trip Updated",
        successMessage: "Your trip has been updated successfully!",
        error: "Error",
        errorMessage: "Failed to update trip",
        cancelTitle: "Cancel Changes",
        cancelMessage:
          "Are you sure you want to cancel? All changes will be lost.",
      },
      editProfile: {
        title: "Edit Profile",
        subtitle: "Update your personal information",
        namePlaceholder: "Enter your name",
        emailPlaceholder: "Enter your email",
        changePassword: "Change password",
        saveChanges: "Save changes",
        updateSuccessTitle: "Profile updated!",
        updateSuccessMessage: "Your profile changes have been saved.",
        updateErrorMessage: "Failed to update profile.",
      },
      changePassword: {
        title: "Change Password",
        subtitle: "Keep your account secure by using a strong password",
        currentPasswordLabel: "Current password",
        currentPasswordPlaceholder: "Enter your current password",
        newPasswordLabel: "New password",
        newPasswordPlaceholder: "Enter a new password",
        confirmPasswordLabel: "Confirm new password",
        confirmPasswordPlaceholder: "Re-enter new password",
        fillAllFields: "Please fill in all fields.",
        passwordsDontMatch: "New passwords do not match.",
        passwordMustBeDifferent:
          "New password must be different from current password.",
        successTitle: "Password changed",
        successMessage: "Your password has been changed successfully.",
        errorMessage:
          "Failed to change password. Please check your current password and try again.",
        saving: "Updating...",
        saveButton: "Update password",
      },
      forgotPassword: {
        title: "Forgot Password",
        subtitle: "Enter your email address and we'll send you a reset link",
        resetPasswordTitle: "Reset Password",
        resetPasswordSubtitle: "Enter your new password",
        emailPlaceholder: "Enter your email address",
        newPasswordLabel: "New password",
        newPasswordPlaceholder: "Enter your new password",
        confirmPasswordLabel: "Confirm password",
        confirmPasswordPlaceholder: "Re-enter your new password",
        sendResetLink: "Send Reset Link",
        resetPassword: "Reset Password",
        emailSentTitle: "Email Sent",
        emailSentMessage: "We've sent a password reset link to {{email}}",
        checkEmailHint: "Please check your inbox and follow the instructions.",
        successTitle: "Password Reset",
        successMessage:
          "Your password has been reset successfully. You can now log in with your new password.",
        requestError: "Failed to send reset email. Please try again.",
        resetError:
          "Failed to reset password. The link may have expired. Please request a new one.",
        passwordsDontMatch: "Passwords do not match.",
      },
      otp: {
        title: "Verify Your Account",
        subtitle: "Enter the 6-digit code sent to your email",
        codePlaceholder: "123456",
        verifyButton: "Verify",
        verifying: "Verifying...",
        invalidCode: "Invalid OTP code",
        codeRequired: "Please enter the 6-digit code",
        verificationFailed: "OTP verification failed",
        successMessage: "Your account has been verified successfully!",
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
        phone: "Numéro de téléphone",
        signIn: "Se connecter",
        signUp: "Créer un compte",
        pleaseWait: "Veuillez patienter...",
        error: "Erreur",
        info: "Information",
        fillAllFields: "Veuillez renseigner tous les champs",
        unexpectedError: "Une erreur inattendue est survenue",
        loginFailed: "Échec de la connexion",
        registerFailed: "Échec de l'inscription",
        noAccount: "Pas de compte ?",
        haveAccount: "Déjà un compte ?",
        ok: "OK",
        cancel: "Annuler",
        validate: "Valider",
        confirm: "Confirmer",
        loading: "Chargement...",
        add: "Ajouter",
        create: "Créer",
        delete: "Supprimer",
        edit: "Modifier",
        save: "Enregistrer",
        discard: "Confirmer",
        logout: "Se déconnecter",
        settings: "Paramètres",
        helpSupport: "Aide & support",
        about: "À propos",
        user: "Utilisateur",
        unknown: "Inconnu",
        welcomeBack: "Bon retour",
        createAccount: "Créer un compte",
        loginToContinue: "Connectez-vous pour continuer",
        signUpToStart: "Inscrivez-vous pour commencer",
        forgotPassword: "Mot de passe oublié ?",
        termsAgree: "En continuant, vous acceptez nos",
        termsAndConditions: "Conditions d'utilisation",
        invalidEmail: "Veuillez entrer une adresse e-mail valide",
        invalidPassword:
          "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.",
        passwordTooShort:
          "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.",
        invalidPhone: "Veuillez entrer un numéro de téléphone valide",
        invalidCredentials: "E-mail ou mot de passe incorrect",
        emailAlreadyInUse: "Cet e-mail est déjà utilisé",
        requiresOtp: "Veuillez vérifier votre compte avec le code envoyé par e-mail",
        requiresOtpExpired: "Votre code de vérification a expiré. Un nouveau code a été envoyé à votre e-mail",
        confirmPassword: "Confirmer le mot de passe",
        passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
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
        members_one: "{{count}} Membre",
        members_other: "{{count}} Membres",
        createNewTripTitle: "Créer un nouveau voyage",
        featureSoon: "Cette fonctionnalité arrive bientôt !",
        apiTestSuccess: "Test API réussi",
        apiTestFailed: "Test API échoué",
        apiTestError:
          "Impossible de se connecter à l'API. Vérifiez que le backend est en cours d'exécution.",
      },
      bookings: {
        header: "Réservations",
        loading: "Chargement de vos réservations...",
        addBooking: "Ajouter une réservation",
        selectOrCreate: "Sélectionner ou créer une réservation",
        createNew: "Créer une nouvelle réservation",
        existingBookings: "Réservations existantes",
        noExistingBookings: "Aucune réservation existante",
        saveError: "Erreur lors de la sauvegarde de la réservation",
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
        type: "Type",
        title: "Titre",
        titlePlaceholder: "Saisir le titre de la réservation",
        date: "Date",
        startDate: "Date de début",
        endDate: "Date de fin",
        time: "Heure",
        selectTime: "Sélectionner l'heure",
        address: "Adresse",
        addressPlaceholder: "Saisir l'adresse",
        description: "Description",
        descriptionPlaceholder: "Saisir la description",
        confirmationNumber: "Numéro de confirmation",
        confirmationNumberPlaceholder: "Saisir le numéro de confirmation",
        price: "Prix",
        currency: "Devise",
        statusLabel: "Statut",
        editBooking: "Modifier la réservation",
        save: "Enregistrer",
        deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette réservation ?",
        titleRequired: "Le titre est requis",
        dateOutOfRange:
          "La date de la réservation doit être dans la plage du voyage",
        selectTrip: "Sélectionner un voyage",
        noTrips: "Aucun voyage disponible",
        noTripsMessage:
          "Vous devez d'abord créer un voyage pour ajouter une réservation.",
        attachments: "Pièces jointes",
        addImage: "Ajouter une image",
        addDocument: "Ajouter un PDF",
        removeAttachmentConfirm: "Supprimer ce fichier ?",
        permissionDenied: "Permission d'accès à la galerie refusée",
        imagePickerError: "Erreur lors de la sélection de l'image",
        documentPickerError: "Erreur lors de la sélection du document",
        endDateBeforeStart: "La date de fin doit être après la date de début",
        details: {
          loading: "Chargement des détails de la réservation...",
          notFound: "Réservation introuvable",
          description: "Description",
          location: "Localisation",
          getDirections: "Obtenir l'itinéraire",
          bookingDetails: "Détails de la réservation",
          confirmationNumber: "Numéro de confirmation :",
          price: "Prix :",
          date: "Date :",
          time: "Heure :",
          attachments: "Pièces jointes",
          opening: "Ouverture",
          editBooking: "Modifier",
          cancelBooking: "Annuler",
          cancelConfirm: "Êtes-vous sûr de vouloir annuler cette réservation ?",
          no: "Non",
          yes: "Oui",
          viewAttachment: "Voir la pièce jointe",
          featureSoon: "Cette fonctionnalité arrive bientôt !",
        },
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
        featureSoon: "Cette fonctionnalité arrive bientôt !",
        details: {
          loading: "Chargement des détails de l'adresse...",
          notFound: "Adresse introuvable",
          address: "Adresse",
          contactInformation: "Informations de contact",
          notes: "Notes",
          coordinatesNotAvailable:
            "Coordonnées non disponibles pour cette adresse",
          getDirections: "Itinéraire",
          editAddress: "Modifier",
          featureSoon: "Cette fonctionnalité arrive bientôt !",
          trip: "Voyage",
        },
        form: {
          title: "Ajouter une adresse",
          editTitle: "Modifier l'adresse",
          trip: "Voyage",
          type: "Type",
          name: "Nom",
          namePlaceholder: "Saisir le nom de l'adresse",
          address: "Adresse",
          addressPlaceholder: "Saisir l'adresse complète",
          city: "Ville",
          cityPlaceholder: "Saisir la ville",
          country: "Pays",
          countryPlaceholder: "Saisir le pays",
          phone: "Téléphone",
          phonePlaceholder: "Ajouter un numéro de téléphone",
          website: "Site web",
          websitePlaceholder: "Ajouter l'URL du site",
          notes: "Notes",
          notesPlaceholder: "Ajouter des notes ou instructions",
          coordinates: "Coordonnées (optionnel)",
          latitude: "Latitude",
          longitude: "Longitude",
          coordinatesHint:
            "Utiliser des degrés décimaux. Exemple : 48.8566 / 2.3522",
          requiredTrip: "Veuillez sélectionner un voyage pour cette adresse.",
          requiredFields:
            "Le nom, l'adresse, la ville et le pays sont obligatoires.",
          invalidCoordinates:
            "Coordonnées invalides. Saisir des nombres valides.",
          submitError: "Impossible d'enregistrer cette adresse. Réessayez.",
          noTrips: "Vous devez créer un voyage avant d'ajouter une adresse.",
        },
      },
      tripDetails: {
        loading: "Chargement des détails du voyage...",
        notFound: "Voyage introuvable",
        inviteFriends: "Inviter des amis",
        editTrip: "Modifier",
        validateTrip: "Valider le voyage",
        validateTripMessage:
          "Êtes-vous sûr de vouloir valider ce voyage ? Cette action ne peut pas être annulée.",
        tripValidated: "Voyage validé",
        tripValidatedMessage: "Votre voyage a été validé avec succès !",
        bookings: "Réservations",
        addresses: "Adresses",
        noBookings: "Aucune réservation",
        noAddresses: "Aucune adresse",
        confirmation: "Confirmation : {{code}}",
        collaborators: "Collaborateurs",
        ownerYou: "Vous (propriétaire)",
        collaborator: "Collaborateur {{index}}",
        featureSoon: "Cette fonctionnalité arrive bientôt !",
        addBooking: "Ajouter une réservation",
        addAddress: "Ajouter une adresse",
        draftMessage:
          "Ce voyage est un brouillon. Validez-le pour le rendre actif.",
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
        featureSoon: "Cette fonctionnalité arrive bientôt !",
        invitations: "Invitations",
        invitationsMessage: "Vous avez",
        noInvitations: "Aucune invitation en attente",
      },
      inviteFriends: {
        loading: "Chargement des amis...",
        header: "Inviter des amis",
        subtitle: "Inviter des amis à collaborer sur",
        inviteByEmail: "Inviter par e-mail",
        enterEmail: "Saisir l'adresse e-mail",
        error: "Erreur",
        enterEmailError: "Veuillez saisir une adresse e-mail",
        invitationSent: "Invitation envoyée",
        invitationSentTo: "Invitation envoyée à",
        friends: "Amis",
        member: "Membre",
        selectedFriends: "Amis sélectionnés",
        sendInvitations: "Envoyer les invitations",
        invitationsSent: "Invitations envoyées",
        invitationsSentTo: "Invitations envoyées à",
        noFriendsSelected: "Aucun ami sélectionné",
        selectFriendsToInvite: "Veuillez sélectionner des amis à inviter",
        invitationMessage: "Vous avez été invité à collaborer sur",
        invitationError: "Échec de l'envoi de l'invitation",
        loadingError: "Échec du chargement des données",
        userNotFound: "Utilisateur introuvable",
        sendingInvitations: "Envoi des invitations...",
      },
      invitation: {
        title: "Invitation au voyage",
        loading: "Chargement de l'invitation...",
        notFound: "Invitation introuvable",
        notFoundMessage: "Ce lien d'invitation est invalide ou a expiré.",
        invitationTitle: "Vous avez été invité à collaborer sur",
        sentTo: "Envoyée à",
        sentOn: "Envoyée le",
        expiresOn: "Expire le",
        expired: "Cette invitation a expiré",
        accept: "Accepter",
        decline: "Refuser",
        accepted: "Invitation acceptée",
        acceptedMessage: "Vous êtes maintenant collaborateur sur ce voyage !",
        declined: "Invitation refusée",
        declinedMessage: "Vous avez refusé cette invitation.",
        declineTitle: "Refuser l'invitation",
        declineMessage: "Êtes-vous sûr de vouloir refuser cette invitation ?",
        statusAccepted: "Acceptée",
        statusDeclined: "Refusée",
        processing: "Traitement...",
        acceptError: "Échec de l'acceptation de l'invitation",
        declineError: "Échec du refus de l'invitation",
        loadingError: "Échec du chargement de l'invitation",
      },
      createTrip: {
        title: "Créer un voyage",
        tripTitle: "Titre du voyage",
        tripTitlePlaceholder: "Saisir le titre du voyage",
        destination: "Destination",
        destinationPlaceholder: "Saisir la destination",
        startDate: "Date de début",
        endDate: "Date de fin",
        description: "Description",
        descriptionPlaceholder: "Parlez-nous de votre voyage...",
        visibility: "Visibilité",
        public: "Public",
        private: "Privé",
        friends: "Amis",
        publicDescription: "Tout le monde peut voir ce voyage",
        privateDescription:
          "Seuls vous et vos collaborateurs peuvent voir ce voyage",
        tags: "Étiquettes",
        addTag: "Ajouter une étiquette",
        createTrip: "Créer le voyage",
        creating: "Création...",
        success: "Voyage créé",
        successMessage: "Votre voyage a été créé avec succès !",
        error: "Erreur",
        titleRequired: "Le titre du voyage est requis",
        destinationRequired: "La destination est requise",
        invalidDates: "La date de fin doit être après la date de début",
        startDatePast: "La date de début ne peut pas être dans le passé",
        errorMessage: "Échec de la création du voyage",
        cancelTitle: "Annuler la création",
        cancelMessage:
          "Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.",
      },
      editTrip: {
        title: "Modifier le voyage",
        loading: "Chargement du voyage...",
        updateTrip: "Mettre à jour",
        updating: "Mise à jour...",
        success: "Voyage mis à jour",
        successMessage: "Votre voyage a été mis à jour avec succès !",
        error: "Erreur",
        errorMessage: "Échec de la mise à jour du voyage",
        cancelTitle: "Annuler les modifications",
        cancelMessage:
          "Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.",
      },
      editProfile: {
        title: "Modifier le profil",
        subtitle: "Mettez à jour vos informations personnelles",
        namePlaceholder: "Entrez votre nom",
        emailPlaceholder: "Entrez votre e-mail",
        changePassword: "Modifier le mot de passe",
        saveChanges: "Enregistrer les modifications",
        updateSuccessTitle: "Profil mis à jour",
        updateSuccessMessage:
          "Les modifications de votre profil ont été enregistrées.",
        updateErrorMessage: "Échec de la mise à jour du profil.",
      },
      changePassword: {
        title: "Modifier le mot de passe",
        subtitle: "Sécurisez votre compte avec un mot de passe solide",
        currentPasswordLabel: "Mot de passe actuel",
        currentPasswordPlaceholder: "Entrez votre mot de passe actuel",
        newPasswordLabel: "Nouveau mot de passe",
        newPasswordPlaceholder: "Entrez un nouveau mot de passe",
        confirmPasswordLabel: "Confirmer le nouveau mot de passe",
        confirmPasswordPlaceholder: "Confirmez votre nouveau mot de passe",
        fillAllFields: "Veuillez renseigner tous les champs.",
        passwordsDontMatch: "Les nouveaux mots de passe ne correspondent pas.",
        passwordMustBeDifferent:
          "Le nouveau mot de passe doit être différent de l'actuel.",
        successTitle: "Mot de passe modifié",
        successMessage: "Votre mot de passe a été modifié avec succès.",
        errorMessage:
          "Échec du changement de mot de passe. Vérifiez votre mot de passe actuel et réessayez.",
        saving: "Mise à jour...",
        saveButton: "Mettre à jour le mot de passe",
      },
      forgotPassword: {
        title: "Mot de passe oublié",
        subtitle:
          "Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation",
        resetPasswordTitle: "Réinitialiser le mot de passe",
        resetPasswordSubtitle: "Entrez votre nouveau mot de passe",
        emailPlaceholder: "Entrez votre adresse e-mail",
        newPasswordLabel: "Nouveau mot de passe",
        newPasswordPlaceholder: "Entrez votre nouveau mot de passe",
        confirmPasswordLabel: "Confirmer le mot de passe",
        confirmPasswordPlaceholder: "Ré-entrez votre nouveau mot de passe",
        sendResetLink: "Envoyer le lien de réinitialisation",
        resetPassword: "Réinitialiser le mot de passe",
        emailSentTitle: "E-mail envoyé",
        emailSentMessage:
          "Nous avons envoyé un lien de réinitialisation à {{email}}",
        checkEmailHint:
          "Veuillez vérifier votre boîte de réception et suivre les instructions.",
        successTitle: "Mot de passe réinitialisé",
        successMessage:
          "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        requestError:
          "Échec de l'envoi de l'e-mail de réinitialisation. Veuillez réessayer.",
        resetError:
          "Échec de la réinitialisation du mot de passe. Le lien a peut-être expiré. Veuillez en demander un nouveau.",
        passwordsDontMatch: "Les mots de passe ne correspondent pas.",
      },
      otp: {
        title: "Vérifiez votre compte",
        subtitle: "Entrez le code à 6 chiffres envoyé à votre e-mail",
        codePlaceholder: "123456",
        verifyButton: "Vérifier",
        verifying: "Vérification...",
        invalidCode: "Code OTP invalide",
        codeRequired: "Veuillez entrer le code à 6 chiffres",
        verificationFailed: "Échec de la vérification OTP",
        successMessage: "Votre compte a été vérifié avec succès !",
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
  keySeparator: ".", // Utiliser le point comme séparateur pour les clés imbriquées
  nsSeparator: false, // Pas de namespace separator
});

export default i18n;
