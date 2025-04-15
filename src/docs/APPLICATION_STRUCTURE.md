
# Application Structure Documentation

## Overview

This application is built using React, TypeScript, and integrates with Supabase for backend functionality. The application follows a component-based architecture with a focus on reusability and maintainability.

## Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/          # React contexts for state management
├── hooks/             # Custom React hooks
├── integrations/      # Third-party integrations (Supabase, etc.)
├── pages/             # Page components
├── services/          # Service functions
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx            # Main application component
```

## Key Components

### Authentication

- `AuthContext` (`src/contexts/AuthContext.tsx`): Manages authentication state
- `useAuth` / `useAuthContext` (`src/hooks/useAuthContext.ts`): Hook to access authentication context
- `Auth.tsx` (`src/pages/Auth.tsx`): Authentication page (login/signup)

### Profile Management

- `Profile.tsx` (`src/pages/Profile.tsx`): User profile page
- `ProfileHeader` (`src/components/ProfileHeader.tsx`): Profile header with user information
- `ProfileEditForm` (`src/components/ProfileEditForm.tsx`): Form to edit user profile
- `ProfileOverview` (`src/components/ProfileOverview.tsx`): Overview of user activity
- `ProfileStats` (`src/components/ProfileStats.tsx`): User statistics
- `SettingsTab` (`src/components/SettingsTab.tsx`): User settings

### Event Management

- `GroupEvents.tsx` (`src/pages/GroupEvents.tsx`): Group events page
- `EventCard` (`src/components/EventCard.tsx`): Event card component
- `EventDetailsModal` (`src/components/EventDetailsModal.tsx`): Modal for event details
- `CreateEventModal` (`src/components/CreateEventModal.tsx`): Modal for creating events

### Places

- `PlacesList` (`src/components/PlacesList.tsx`): List of places
- `PlaceCard` (`src/components/PlaceCard.tsx`): Place card component
- `PlaceDetails` (`src/pages/PlaceDetails.tsx`): Place details page
- `SearchFilters` (`src/components/SearchFilters.tsx`): Filters for places

### Navigation

- `Navbar` (`src/components/Navbar.tsx`): Top navigation bar
- `BottomNav` (`src/components/BottomNav.tsx`): Bottom navigation bar (mobile)

## State Management

The application uses a combination of:

1. **React Context API**: For global state like authentication
2. **React Query**: For server state management
3. **React useState/useReducer**: For component-level state

### Authentication State

Authentication state is managed through the `AuthContext`. It provides:

- `user`: The current authenticated user
- `session`: The current user session
- `profile`: The user's profile information
- Authentication methods: `signIn`, `signUp`, `signOut`

### Data Fetching State

Server state is managed using React Query, which provides:

- Automatic caching
- Background refetching
- Loading and error states
- Pagination and infinite scrolling

## Routing

The application uses React Router for routing:

```typescript
// Main routes
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/events" element={<GroupEvents />} />
  <Route path="/bookings" element={<Bookings />} />
  <Route path="/place/:id" element={<PlaceDetails />} />
  <Route path="/inbox" element={<Inbox />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/onboarding" element={<Onboarding />} />
  <Route path="/location-picker" element={<LocationPicker />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Styling

The application uses Tailwind CSS for styling with the shadcn/ui component library. Key styling patterns:

- Utility-first CSS with Tailwind
- Responsive design with mobile-first approach
- Theme support (light/dark mode)
- Consistent spacing, typography, and color system

## Error Handling

Error handling is implemented at multiple levels:

1. **Global Error Handling**: For uncaught exceptions
2. **API Error Handling**: For backend API errors
3. **Form Validation**: For user input errors

## Responsive Design

The application is designed to be fully responsive:

- Mobile-first approach
- Different layouts for mobile and desktop
- Touch-optimized interactions for mobile
- Device-specific optimizations

## Performance Optimizations

Performance is optimized through:

- Code splitting and lazy loading
- Memoization of components
- Efficient re-rendering with React hooks
- Image optimization
- Cache management

## Accessibility

Accessibility features include:

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

## Deployment

The application can be deployed through:

- Lovable's built-in deployment
- Custom domain support
- Environment-specific configurations

## Adding New Features

To add new features to the application:

1. **Create Components**: Add new components in the `components` directory
2. **Add Routes**: Update the router configuration if adding new pages
3. **Extend Types**: Add new TypeScript interfaces or types as needed
4. **Update API**: Add new API integrations or extend existing ones
5. **Add Tests**: Write tests for new functionality

## Best Practices

When working with this application, follow these best practices:

1. **Component Structure**: Keep components small and focused
2. **State Management**: Use the appropriate state management approach
3. **API Calls**: Use React Query for data fetching
4. **Error Handling**: Implement proper error handling at all levels
5. **Accessibility**: Follow accessibility best practices
6. **Performance**: Optimize for performance
7. **TypeScript**: Leverage TypeScript for type safety
8. **Testing**: Write tests for critical functionality
