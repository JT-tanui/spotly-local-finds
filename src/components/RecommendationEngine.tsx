import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { Place } from '@/types';
import PlaceCard from '@/components/PlaceCard';
import AppConfig from '@/config';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Recommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  distance: number;
  imageUrl: string;
  match_percentage: number;
  features: string[];
}

interface RecommendationResponse {
  recommendations: Recommendation[];
  explanation: string;
}

const fetchRecommendations = async (
  userId: string | undefined, 
  location: { lat: number; lng: number } | null,
  preferences?: any
): Promise<RecommendationResponse> => {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-recommendation', {
      body: { userId, location, preferences },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw new Error('Failed to get recommendations');
  }
};

// Convert recommendation to Place type for PlaceCard component
const recommendationToPlace = (rec: Recommendation): Place => ({
  id: rec.id,
  name: rec.name,
  category: rec.category as any,
  description: rec.description,
  address: `${rec.distance.toFixed(1)} km away`,
  rating: rec.rating,
  reviewCount: Math.floor(Math.random() * 100) + 10,
  price: rec.price,
  imageUrl: rec.imageUrl,
  location: { lat: 0, lng: 0 }, // Placeholder
  distance: rec.distance,
  isFeatured: rec.match_percentage > 85
});

interface RecommendationEngineProps {
  maxItems?: number;
  showRefresh?: boolean;
  className?: string;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ 
  maxItems = 3, 
  showRefresh = true,
  className = ''
}) => {
  const { user, profile } = useAuth();
  const { location } = useLocation();
  const { toast } = useToast();
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Fetch user preferences from Supabase
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user?.id && !AppConfig.skipAuthentication) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error) throw error;
          if (data) setUserPreferences(data);
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }
    };

    fetchUserPreferences();
  }, [user?.id]);

  // Query for recommendations
  const { 
    data, 
    isLoading, 
    error, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['recommendations', user?.id, location?.lat, location?.lng, userPreferences],
    queryFn: () => fetchRecommendations(
      user?.id, 
      location ? { lat: location.lat, lng: location.lng } : null,
      userPreferences
    ),
    enabled: !!location, // Only run when location is available
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing recommendations",
      description: "Finding new spots just for you",
    });
  };

  if (error) {
    return (
      <Card className={`${className} border-red-200 bg-red-50`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-red-500">Failed to load recommendations</p>
            <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
          <h2 className="text-lg font-medium">For You</h2>
          {isFetching && !isLoading && (
            <span className="ml-2">
              <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
            </span>
          )}
        </div>
        
        {showRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(maxItems)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : data?.recommendations ? (
        <div className="space-y-6">
          {data.explanation && (
            <p className="text-sm text-muted-foreground">{data.explanation}</p>
          )}
          
          <div className="space-y-4">
            {data.recommendations.slice(0, maxItems).map((rec) => (
              <div key={rec.id} className="relative">
                <PlaceCard place={recommendationToPlace(rec)} onClick={() => handlePlaceClick(recommendationToPlace(rec))} />
                {rec.match_percentage >= 90 && (
                  <Badge className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500">
                    {rec.match_percentage}% Match
                  </Badge>
                )}
                {rec.match_percentage >= 75 && rec.match_percentage < 90 && (
                  <Badge className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-indigo-500">
                    {rec.match_percentage}% Match
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No recommendations available</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationEngine;
