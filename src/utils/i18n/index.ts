import enAddresses from "./en/addresses";
import enAuth from "./en/auth";
import enBookings from "./en/bookings";
import enCommon from "./en/common";
import enErrors from "./en/errors";
import enFriends from "./en/friends";
import enIdeas from "./en/ideas";
import enInvitations from "./en/invitations";
import enLegal from "./en/legal";
import enNotifications from "./en/notifications";
import enProfile from "./en/profile";
import enTripManagement from "./en/tripManagement";
import enTrips from "./en/trips";

import frAddresses from "./fr/addresses";
import frAuth from "./fr/auth";
import frBookings from "./fr/bookings";
import frCommon from "./fr/common";
import frErrors from "./fr/errors";
import frFriends from "./fr/friends";
import frIdeas from "./fr/ideas";
import frInvitations from "./fr/invitations";
import frLegal from "./fr/legal";
import frNotifications from "./fr/notifications";
import frProfile from "./fr/profile";
import frTripManagement from "./fr/tripManagement";
import frTrips from "./fr/trips";

export const resources = {
  en: {
    translation: {
      ...enCommon,
      ...enTrips,
      ...enTripManagement,
      ...enBookings,
      ...enAddresses,
      ...enFriends,
      ...enInvitations,
      ...enProfile,
      ...enAuth,
      ...enLegal,
      ...enNotifications,
      ...enIdeas,
      ...enErrors,
    },
  },
  fr: {
    translation: {
      ...frCommon,
      ...frTrips,
      ...frTripManagement,
      ...frBookings,
      ...frAddresses,
      ...frFriends,
      ...frInvitations,
      ...frProfile,
      ...frAuth,
      ...frLegal,
      ...frNotifications,
      ...frIdeas,
      ...frErrors,
    },
  },
};
