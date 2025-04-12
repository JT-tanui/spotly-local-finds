
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { userId, location, preferences, limit = 5 } = await req.json();
    
    console.log("Received recommendation request for user:", userId);
    console.log("Location:", location);
    console.log("Preferences:", preferences);
    
    // Create a Supabase client with the Supabase URL and service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Optional: Get user profile and preferences from database
    let userPreferences = preferences;
    
    if (userId && !preferences) {
      console.log("Fetching user preferences from database");
      const { data: preferencesData, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user preferences:", error);
      } else if (preferencesData) {
        userPreferences = {
          categories: preferencesData.favorite_categories,
          priceRange: preferencesData.price_range,
          dietaryPreferences: preferencesData.dietary_preferences,
          accessibility: preferencesData.accessibility_needs
        };
        console.log("Found user preferences:", userPreferences);
      }
    }
    
    // In a real implementation, here you would:
    // 1. Call an AI service (OpenAI, etc.) to get personalized recommendations
    // 2. Combine with real-time data (weather, time of day, etc.)
    // 3. Apply business rules (promotions, partner venues, etc.)
    
    // For this demo, we'll create simulated personalized recommendations
    // based on the mock places data and user preferences
    
    // Simulate personalized recommendations with different scores
    console.log("Generating simulated recommendations");
    
    // Here we would fetch places from a real database, but since we're using mock data
    // we'll simulate this by returning mock recommendations
    const mockRecommendations = generateMockRecommendations(userPreferences, limit);
    
    console.log(`Generated ${mockRecommendations.length} recommendations`);
    
    return new Response(
      JSON.stringify({
        recommendations: mockRecommendations,
        explanation: generateExplanationText(userPreferences)
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
    
  } catch (error) {
    console.error("Error in ai-recommendation function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing your request" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to generate mock recommendations
function generateMockRecommendations(preferences: any, limit: number) {
  // Simulate factors that would influence real recommendations
  const timeOfDay = new Date().getHours();
  const isLunchTime = timeOfDay >= 11 && timeOfDay <= 14;
  const isDinnerTime = timeOfDay >= 17 && timeOfDay <= 21;
  const isWeekend = [0, 6].includes(new Date().getDay());
  
  // Mock place generator - in real implementation we'd query a database
  const mockPlaces = [
    {
      id: "rec-1",
      name: "Urban Harvest Café",
      category: "cafe",
      description: "A cozy spot with locally sourced ingredients and freshly baked goods",
      price: 2,
      rating: 4.7,
      distance: 1.2,
      imageUrl: "https://i.pravatar.cc/150?img=1",
      features: ["outdoor_seating", "vegetarian_options", "wifi"]
    },
    {
      id: "rec-2",
      name: "River View Restaurant",
      category: "restaurant",
      description: "Upscale dining with panoramic views and seasonal menu",
      price: 3,
      rating: 4.5,
      distance: 3.4,
      imageUrl: "https://i.pravatar.cc/150?img=2", 
      features: ["fine_dining", "scenic_view", "full_bar"]
    },
    {
      id: "rec-3",
      name: "Botanical Gardens",
      category: "park",
      description: "Expansive gardens featuring rare plants from around the world",
      price: 1,
      rating: 4.8,
      distance: 4.1,
      imageUrl: "https://i.pravatar.cc/150?img=3",
      features: ["wheelchair_accessible", "family_friendly", "guided_tours"]
    },
    {
      id: "rec-4",
      name: "Craft Brewery & Pub",
      category: "bar",
      description: "Local brewery with rotating taps and pub fare",
      price: 2,
      rating: 4.3,
      distance: 1.8,
      imageUrl: "https://i.pravatar.cc/150?img=4",
      features: ["live_music", "happy_hour", "outdoor_patio"]
    },
    {
      id: "rec-5",
      name: "Modern Art Gallery",
      category: "museum",
      description: "Contemporary art exhibits in a renovated warehouse space",
      price: 2,
      rating: 4.6,
      distance: 2.9,
      imageUrl: "https://i.pravatar.cc/150?img=5",
      features: ["wheelchair_accessible", "guided_tours", "gift_shop"]
    },
    {
      id: "rec-6",
      name: "Comedy Theater",
      category: "entertainment",
      description: "Stand-up comedy and improv shows in an intimate venue",
      price: 3,
      rating: 4.4,
      distance: 3.7,
      imageUrl: "https://i.pravatar.cc/150?img=6",
      features: ["bar_service", "weekend_shows", "local_talent"]
    },
    {
      id: "rec-7",
      name: "Designer Outlet",
      category: "shopping",
      description: "Luxury brands at discounted prices in an outdoor mall",
      price: 4,
      rating: 4.2,
      distance: 5.3,
      imageUrl: "https://i.pravatar.cc/150?img=7",
      features: ["parking", "food_court", "wheelchair_accessible"]
    },
    {
      id: "rec-8",
      name: "Spa & Wellness Center",
      category: "fitness",
      description: "Full-service spa with fitness classes and pool",
      price: 4,
      rating: 4.9,
      distance: 4.8,
      imageUrl: "https://i.pravatar.cc/150?img=8",
      features: ["massage", "sauna", "yoga_classes"]
    },
    {
      id: "rec-9",
      name: "Waterfront Park",
      category: "park",
      description: "Urban park with walking trails and water features",
      price: 1,
      rating: 4.7,
      distance: 2.1,
      imageUrl: "https://i.pravatar.cc/150?img=9",
      features: ["dog_friendly", "picnic_areas", "public_art"]
    },
    {
      id: "rec-10",
      name: "Historic Tavern",
      category: "bar",
      description: "300-year-old pub with traditional fare and local beers",
      price: 2,
      rating: 4.4,
      distance: 1.5,
      imageUrl: "https://i.pravatar.cc/150?img=10",
      features: ["historical_site", "live_music", "outdoor_seating"]
    }
  ];
  
  // Apply preference-based scoring
  const scoredPlaces = mockPlaces.map(place => {
    let score = 0;
    
    // Category match
    if (preferences?.categories?.includes(place.category)) {
      score += 30;
    }
    
    // Price range match
    if (preferences?.priceRange && 
        place.price >= preferences.priceRange[0] && 
        place.price <= preferences.priceRange[1]) {
      score += 20;
    }
    
    // Distance (closer is better)
    score += Math.max(0, 10 - place.distance * 2);
    
    // Rating boost
    score += place.rating * 5;
    
    // Time-of-day contextual boost
    if (isLunchTime && ['restaurant', 'cafe'].includes(place.category)) {
      score += 15;
    }
    if (isDinnerTime && ['restaurant', 'bar'].includes(place.category)) {
      score += 15;
    }
    if (isWeekend && ['entertainment', 'park', 'museum'].includes(place.category)) {
      score += 10;
    }
    
    // Feature matches for accessibility
    if (preferences?.accessibility?.length > 0) {
      const accessibilityMatch = place.features.some(
        feature => preferences.accessibility.some(
          a => feature.includes(a.toLowerCase().replace('-', '_'))
        )
      );
      if (accessibilityMatch) {
        score += 10;
      }
    }
    
    return {
      ...place,
      score,
      match_percentage: Math.min(100, Math.round(score / 1.5))
    };
  });
  
  // Sort by score and return top recommendations
  return scoredPlaces
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Helper function to generate explanation text based on preferences
function generateExplanationText(preferences: any) {
  if (!preferences) {
    return "Recommended based on popularity and ratings.";
  }
  
  const parts = [];
  
  if (preferences.categories?.length > 0) {
    parts.push(`your interest in ${preferences.categories.join(', ')}`);
  }
  
  if (preferences.priceRange) {
    const priceText = 
      preferences.priceRange[0] === preferences.priceRange[1]
        ? `${'$'.repeat(preferences.priceRange[0])} price point`
        : `${'$'.repeat(preferences.priceRange[0])} to ${'$'.repeat(preferences.priceRange[1])} price range`;
    
    parts.push(priceText);
  }
  
  if (parts.length === 0) {
    return "Personalized recommendations based on your profile.";
  }
  
  return `Recommended based on ${parts.join(' and ')}.`;
}
