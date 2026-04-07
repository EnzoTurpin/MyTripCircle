import addresses from "./addresses";
import auth from "./auth";
import bookings from "./bookings";
import common from "./common";
import errors from "./errors";
import friends from "./friends";
import ideas from "./ideas";
import invitations from "./invitations";
import legal from "./legal";
import notifications from "./notifications";
import profile from "./profile";
import tripManagement from "./tripManagement";
import trips from "./trips";

export const resources = {
  en: {
    translation: {
      ...common.en,
      ...trips.en,
      ...tripManagement.en,
      ...bookings.en,
      ...addresses.en,
      ...friends.en,
      ...invitations.en,
      ...profile.en,
      ...auth.en,
      ...legal.en,
      ...notifications.en,
      ...ideas.en,
      ...errors.en,
    },
  },
  fr: {
    translation: {
      ...common.fr,
      ...trips.fr,
      ...tripManagement.fr,
      ...bookings.fr,
      ...addresses.fr,
      ...friends.fr,
      ...invitations.fr,
      ...profile.fr,
      ...auth.fr,
      ...legal.fr,
      ...notifications.fr,
      ...ideas.fr,
      ...errors.fr,
    },
  },
};
