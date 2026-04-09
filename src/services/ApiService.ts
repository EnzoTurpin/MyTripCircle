// Barrel de compatibilité — regroupe tous les modules API par domaine.
// Les imports existants `ApiService.xxx` continuent de fonctionner.
// Pour les nouveaux fichiers, préférer l'import direct du module correspondant :
//   import { tripsApi } from "./api/tripsApi"

export type { HttpMethod } from "./api/apiCore";

import { authApi }          from "./api/authApi";
import { tripsApi }         from "./api/tripsApi";
import { bookingsApi }      from "./api/bookingsApi";
import { addressesApi }     from "./api/addressesApi";
import { invitationsApi }   from "./api/invitationsApi";
import { friendsApi }       from "./api/friendsApi";
import { userApi }          from "./api/userApi";
import { subscriptionsApi } from "./api/subscriptionsApi";
import { itineraryApi }     from "./api/itineraryApi";

export const ApiService = {
  ...authApi,
  ...tripsApi,
  ...bookingsApi,
  ...addressesApi,
  ...invitationsApi,
  ...friendsApi,
  ...userApi,
  ...subscriptionsApi,
  ...itineraryApi,
};

export default ApiService;
