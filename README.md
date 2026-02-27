# MyTripCircle

A modern React Native mobile application for collaborative trip planning with friends. Built with Expo, TypeScript, and React Navigation.

## Features

### 🎯 Core Functionality

- **Trip Management**: Create, edit, and organize your travel plans
- **Booking Management**: Track flights, trains, hotels, restaurants, and activities
- **Address Management**: Store and manage important locations
- **Collaborative Planning**: Invite friends to collaborate on trips
- **Real-time Updates**: Share modifications with trip collaborators

### 📱 User Experience

- **Modern UI/UX**: Clean, intuitive interface with gradient designs
- **Responsive Design**: Optimized for both iOS and Android
- **Offline Support**: Data persistence with AsyncStorage
- **Type Safety**: Full TypeScript implementation

### 🔐 Authentication

- User registration and login
- Profile management
- Secure data storage

## Technology Stack

- **React Native**: Mobile app framework
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library
- **AsyncStorage**: Local data persistence
- **LinearGradient**: UI styling
- **Ionicons**: Icon library

## Project Structure

```
MyTripCircle/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── TripsContext.tsx # Trip data management
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/           # Application screens
│   │   ├── AuthScreen.tsx
│   │   ├── TripsScreen.tsx
│   │   ├── BookingsScreen.tsx
│   │   ├── AddressesScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── TripDetailsScreen.tsx
│   │   ├── BookingDetailsScreen.tsx
│   │   ├── AddressDetailsScreen.tsx
│   │   └── InviteFriendsScreen.tsx
│   ├── services/          # Data management
│   │   └── DataService.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
├── App.tsx                 # Main application component
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd MyTripCircle
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file at the project root and set your Google Places API key:

   ```bash
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=<your-google-places-key>
   ```

   The `EXPO_PUBLIC_` prefix is required so that Expo can expose the key at runtime for the address auto-complete feature.

4. **Start the development server**

   ```bash
   npm run start:clear
   ```

5. **Lancer sur le simulateur iOS**

   - **Option A – avec Expo (recommandé pour tester)**  
     Démarrez le serveur (`npm run start` ou `npm run dev`), puis appuyez sur **`i`** dans le terminal pour ouvrir l’app dans le simulateur iOS (Xcode doit être installé).

   - **Option B – build natif sur simulateur**  
     Pour lancer directement sur le simulateur sans passer par le menu Expo :
     ```bash
     npm run ios
     ```
     ou `npm run ios:simulator`.  
     La première fois, Expo génère le projet natif iOS (dossier `ios/`) et lance le simulateur. Le backend doit tourner sur votre Mac (ex. `npm run server`).  
     L’app utilise `EXPO_PUBLIC_API_BASE_URL=http://localhost:4000` du `.env` pour joindre l’API depuis le simulateur.

## Key Features Implementation

### Authentication System

- User registration and login with email/password
- Persistent authentication state
- Profile management

### Trip Management

- Create new trips with details (title, destination, dates)
- View trip list with filtering and search
- Edit trip information
- Delete trips

### Booking Management

- Add bookings for flights, trains, hotels, restaurants, activities
- Track booking status (confirmed, pending, cancelled)
- Store confirmation numbers and pricing
- Filter bookings by type

### Address Management

- Store important locations with Google Places auto-completion- Contact information (phone, website)
- Notes and additional details
- Get directions integration

### Collaboration Features

- Invite friends to trips via email
- Manage trip collaborators
- Shared editing permissions
- Real-time updates

## Data Models

### Trip

```typescript
interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  ownerId: string;
  collaborators: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Booking

```typescript
interface Booking {
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
```

### Address

```typescript
interface Address {
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
```

## Navigation Structure

### Main Navigation (Tab Navigator)

- **Trips**: View and manage trips
- **Bookings**: Track all bookings
- **Addresses**: Manage locations
- **Profile**: User profile and settings

### Stack Navigation

- Authentication flow
- Trip details
- Booking details
- Address details
- Friend invitations

## State Management

### Authentication Context

- User login/logout state
- Profile information
- Authentication methods

### Trips Context

- Trip data management
- Booking operations
- Address management
- Data persistence

## Data Persistence

- **AsyncStorage**: Local data storage
- **DataService**: Centralized data management
- **CRUD Operations**: Create, read, update, delete
- **Data Export/Import**: Backup and restore functionality

## UI/UX Design

### Design Principles

- **Modern**: Clean, contemporary interface
- **Intuitive**: Easy-to-use navigation
- **Consistent**: Unified design language
- **Accessible**: User-friendly for all users

### Color Scheme

- Primary: #007AFF (Blue)
- Secondary: #5856D6 (Purple)
- Success: #34C759 (Green)
- Warning: #FF9500 (Orange)
- Error: #FF3B30 (Red)

### Components

- Gradient backgrounds
- Card-based layouts
- Icon integration
- Responsive typography

## Development Guidelines

### Code Structure

- TypeScript for type safety
- Functional components with hooks
- Context API for state management
- Service layer for data operations

### Best Practices

- Consistent naming conventions
- Proper error handling
- Loading states
- User feedback

## Future Enhancements

### Planned Features

- Real-time collaboration
- Push notifications
- Offline synchronization
- Advanced trip templates
- Expense tracking
- Social sharing
- Integration with travel services

### Technical Improvements

- Performance optimization
- Enhanced error handling
- Better offline support
- Advanced caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**MyTripCircle** - Making travel planning collaborative and fun! ✈️🌍
