
# API Documentation

## Overview

This application uses Supabase as the backend service. Supabase provides:
- Authentication
- Database (PostgreSQL)
- Storage
- Edge Functions (for server-side logic)

## Base Configuration

The Supabase client is configured in `src/integrations/supabase/client.ts`. It uses the following environment variables:
- SUPABASE_URL: The URL of your Supabase project
- SUPABASE_PUBLISHABLE_KEY: The public API key for your Supabase project

## Authentication

### Authentication Flows

The application supports the following authentication flows:
- Email/password authentication
- Social login (if configured)

### Authentication Helpers

The following helper functions are available for authentication:

```typescript
// Get the current user
const user = await getCurrentUser();

// Get the current session
const session = await getCurrentSession();

// Get a user profile
const profile = await getUserProfile(userId);
```

### Authentication Context

The application uses an AuthContext (`src/contexts/AuthContext.tsx`) to manage authentication state. This context provides:

- `user`: The current authenticated user
- `session`: The current session
- `profile`: The user's profile information
- `isLoading`: Loading state for authentication
- `signIn(email, password)`: Function to sign in
- `signUp(email, password, metadata)`: Function to sign up
- `signOut()`: Function to sign out
- `isAuthenticated`: Boolean indicating if the user is authenticated

## Data Models

### User Profile

The user profile model is defined in `src/types/index.ts`:

```typescript
interface UserProfile {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  email: string;
  phone?: string;
  website?: string;
  bio?: string;
  location?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
    email_frequency?: 'daily' | 'weekly' | 'never';
    push_notifications?: boolean;
    privacy?: 'public' | 'private';
  };
  stats?: {
    bookings_count: number;
    saved_count: number;
    free_reservations: number;
    loyalty_points: number;
  };
  created_at?: string;
  updated_at?: string;
}
```

### Events

Events are stored in the `events` table and have the following structure:

```typescript
interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  place_id: string;
  creator_id: string;
  status: string;
  max_participants: number | null;
  created_at: string;
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  participants?: EventParticipant[];
  participants_count?: number;
}
```

### Places

Places are stored in the `places` table and have the following structure:

```typescript
interface Place {
  id: string;
  name: string;
  imageUrl: string;
  address: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: {
    lat: number;
    lng: number;
  };
  description?: string;
  distance?: number;
  price?: number;
  openHours?: {
    open: boolean;
    hours: string;
  };
  isFeatured?: boolean;
}
```

## Data Fetching Patterns

### Direct Supabase Queries

For simple data fetching, you can use the Supabase client directly:

```typescript
// Fetch all events
const { data, error } = await supabase
  .from('events')
  .select('*')
  .order('event_date', { ascending: true });

// Fetch a specific event
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('id', eventId)
  .single();

// Insert a new event
const { data, error } = await supabase
  .from('events')
  .insert({
    title: 'New Event',
    description: 'Event description',
    event_date: new Date().toISOString(),
    place_id: 'place-id',
    creator_id: userId,
    status: 'active'
  });

// Update an event
const { data, error } = await supabase
  .from('events')
  .update({ title: 'Updated Event Title' })
  .eq('id', eventId);

// Delete an event
const { error } = await supabase
  .from('events')
  .delete()
  .eq('id', eventId);
```

### Using React Query

For more complex data fetching with caching and synchronization, we use React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch events with React Query
const fetchEvents = async () => {
  const { data, error } = await supabase.from('events').select('*');
  if (error) throw error;
  return data;
};

const { data: events, isLoading, error } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents
});

// Create a new event with React Query
const createEvent = async (newEvent) => {
  const { data, error } = await supabase.from('events').insert(newEvent);
  if (error) throw error;
  return data;
};

const queryClient = useQueryClient();

const { mutate } = useMutation({
  mutationFn: createEvent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }
});
```

## Row Level Security (RLS)

Supabase uses PostgreSQL's Row Level Security to control access to data. Here's how RLS is configured for our tables:

### Events Table

- Users can view all public events
- Users can only edit/delete events they created
- Users can only see private events they created or are invited to

### Profiles Table

- Users can view all public profiles
- Users can only edit their own profile
- Admin users can edit any profile

## Edge Functions

Edge functions provide server-side functionality. These are defined in the `supabase/functions` directory.

### Calling Edge Functions

You can call edge functions using the Supabase client:

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { param1: 'value1', param2: 'value2' }
});
```

## Error Handling

Error handling is standardized across the application:

```typescript
try {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  
  // Process data
} catch (error) {
  console.error('Error fetching data:', error);
  // Show user-friendly error message
  toast({
    title: "Error",
    description: error.message || "An error occurred",
    variant: "destructive"
  });
}
```

## Best Practices

### Data Fetching

1. Use React Query for complex data fetching scenarios
2. Use direct Supabase queries for simple operations
3. Handle loading and error states consistently
4. Implement proper caching strategies

### Authentication

1. Always check if a user is authenticated before making protected requests
2. Use the AuthContext to access the current user
3. Implement proper redirects for unauthenticated users

### Security

1. Never expose sensitive data in client-side code
2. Always use RLS policies to restrict access to data
3. Validate all user input before sending it to the server
4. Use edge functions for operations that require sensitive API keys

## Examples

### Complete Example: Fetching and Displaying User Profile

```typescript
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  
  const fetchProfile = async () => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return data;
  };
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: fetchProfile,
    enabled: !!user?.id
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;
  
  return (
    <div>
      <h1>{profile.full_name}</h1>
      <p>{profile.email}</p>
      {/* Display other profile information */}
    </div>
  );
};

export default ProfilePage;
```
