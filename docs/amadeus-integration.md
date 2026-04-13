# Intégration Amadeus API — MyTripCircle

## Résumé

Ce document décrit la stratégie d'intégration de l'API Amadeus dans MyTripCircle pour permettre la recherche de vols, trains et hôtels, ainsi que la redirection vers la réservation.

---

## 1. Présentation d'Amadeus

[Amadeus for Developers](https://developers.amadeus.com) est la plateforme Self-Service d'Amadeus IT Group, l'un des leaders mondiaux du travel tech. Elle donne accès à un catalogue d'APIs couvrant :

- Recherche de vols
- Recherche d'hôtels
- Analyse de prix
- Points of Interest
- Météo de destination
- Et plus encore

---

## 2. Modèle de tarification

| Environnement | Coût | Usage |
|---------------|------|-------|
| **Sandbox** | Gratuit | Développement et tests, données simulées |
| **Production — Free tier** | Gratuit | Faible volume, données réelles |
| **Production — Pay-per-call** | ~0,01–0,05 € / requête | Volume élevé |
| **Enterprise** | Contrat négocié | Booking réel, accréditation requise |

> Pour le développement et un MVP, l'accès est entièrement gratuit.

---

## 3. APIs cibles pour MyTripCircle

### 3.1 Vols — Flight Offers Search

**Endpoint** : `GET /v2/shopping/flight-offers`

Paramètres principaux :
- `originLocationCode` — code IATA de départ (ex: `CDG`)
- `destinationLocationCode` — code IATA d'arrivée (ex: `JFK`)
- `departureDate` — date au format `YYYY-MM-DD`
- `returnDate` — optionnel, pour les allers-retours
- `adults` — nombre de passagers adultes
- `currencyCode` — devise (ex: `EUR`)
- `max` — nombre max de résultats

Exemple de réponse (simplifié) :
```json
{
  "data": [
    {
      "id": "1",
      "price": { "total": "245.60", "currency": "EUR" },
      "itineraries": [
        {
          "duration": "PT7H30M",
          "segments": [
            {
              "departure": { "iataCode": "CDG", "at": "2026-06-01T08:00:00" },
              "arrival": { "iataCode": "JFK", "at": "2026-06-01T10:30:00" },
              "carrierCode": "AF",
              "number": "006"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 3.2 Hôtels — Hotel List + Hotel Offers

**Etape 1 — Lister les hôtels par ville** : `GET /v1/reference-data/locations/hotels/by-city`

Paramètres :
- `cityCode` — code IATA de la ville (ex: `PAR`)

**Etape 2 — Rechercher les disponibilités** : `GET /v3/shopping/hotel-offers`

Paramètres principaux :
- `hotelIds` — liste d'IDs récupérés à l'étape 1
- `checkInDate` / `checkOutDate`
- `adults`
- `currencyCode`

---

### 3.3 Analyse de prix — Flight Price Analysis

**Endpoint** : `GET /v1/analytics/itinerary-price-metrics`

Permet d'afficher si un prix est **bas / normal / élevé** par rapport au marché. Utile pour guider l'utilisateur dans son choix.

---

## 4. Authentification

Amadeus utilise OAuth 2.0 (Client Credentials).

### Obtenir un token

```
POST https://test.api.amadeus.com/v1/security/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_API_KEY
&client_secret=YOUR_API_SECRET
```

Réponse :
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 1799
}
```

> Le token expire après ~30 minutes. Il faut le rafraîchir automatiquement côté serveur.

### Sécurité

- **Ne jamais appeler Amadeus directement depuis le client React Native**
- Toutes les requêtes passent par le **backend MyTripCircle** (`/server`)
- Le backend stocke les credentials en variables d'environnement (`AMADEUS_API_KEY`, `AMADEUS_API_SECRET`)
- Le token est mis en cache côté serveur et renouvelé avant expiration

---

## 5. Architecture d'intégration

```
[App React Native]
      │
      │  GET /api/flights?from=CDG&to=JFK&date=2026-06-01
      │
[Backend MyTripCircle (Express/Node)]
      │
      │  1. Vérifie/renouvelle le token Amadeus
      │  2. Appelle Amadeus API
      │  3. Formate et retourne la réponse
      │
[Amadeus API]
```

### Endpoints backend à créer

| Route | Description |
|-------|-------------|
| `GET /api/travel/flights` | Recherche de vols |
| `GET /api/travel/hotels` | Recherche d'hôtels |
| `GET /api/travel/price-analysis` | Analyse du prix d'un vol |

---

## 6. Réservation — Stratégie de redirection

La réservation in-app complète (avec paiement) nécessite un contrat Enterprise Amadeus et une accréditation IATA. Pour le MVP, la stratégie retenue est la **redirection partenaire** :

### Vols

Rediriger vers le site de la compagnie ou un comparateur avec les paramètres pré-remplis :

```
https://www.skyscanner.fr/transport/vols/CDG/JFK/2026-06-01/
```

ou via un lien affilié Google Flights, Kayak, etc.

### Hôtels

Rediriger vers Booking.com avec les paramètres :

```
https://www.booking.com/searchresults.fr.html
  ?ss=Paris
  &checkin=2026-06-01
  &checkout=2026-06-05
  &group_adults=2
```

> Cette approche est utilisée par la majorité des apps travel (TripAdvisor, Hopper, etc.) et ne nécessite aucun accord commercial.

---

## 7. SDK officiel

Amadeus fournit un SDK JavaScript/TypeScript :

```bash
npm install amadeus
```

Usage (côté backend uniquement) :

```typescript
import Amadeus from 'amadeus';

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

const response = await amadeus.shopping.flightOffersSearch.get({
  originLocationCode: 'CDG',
  destinationLocationCode: 'JFK',
  departureDate: '2026-06-01',
  adults: '1',
  currencyCode: 'EUR',
  max: '10',
});
```

---

## 8. Étapes pour démarrer

1. Créer un compte sur [developers.amadeus.com](https://developers.amadeus.com)
2. Créer une application → obtenir `API Key` et `API Secret`
3. Tester en Sandbox avec les données de test
4. Ajouter `AMADEUS_API_KEY` et `AMADEUS_API_SECRET` dans `.env` du backend
5. Implémenter le service d'authentification (token + cache)
6. Implémenter les endpoints backend
7. Connecter les écrans React Native via les nouveaux endpoints
8. Passer en production (changer l'URL de base de `test.api.amadeus.com` vers `api.amadeus.com`)

---

## 9. Variables d'environnement à ajouter

Dans `server/.env` :

```
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
AMADEUS_ENV=test  # ou "production"
```

Dans `server/.env.example` (sans valeurs) :

```
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
AMADEUS_ENV=test
```

---

## 10. Liens utiles

- Documentation officielle : https://developers.amadeus.com/self-service
- Portail développeur : https://developers.amadeus.com
- SDK npm : https://www.npmjs.com/package/amadeus
- Sandbox test data : https://amadeus4dev.github.io/developer-guides/test-data/
- Codes IATA villes : https://www.iata.org/en/publications/directories/code-search/
