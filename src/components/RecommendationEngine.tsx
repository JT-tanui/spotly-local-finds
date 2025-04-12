
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import { Place } from '@/types';

// Sample recommendations data for fallback
const sampleRecommendations = [
  {
    id: 'rec1',
    name: 'Green Park Cafe',
    category: 'Cafe',
    rating: 4.7,
    distance: 0.6,
    imageUrl: 'https://i.pravatar.cc/300?img=20',
    description: 'Cozy cafe with excellent pastries and coffee.',
    reason: 'Based on your coffee preferences'
  },
  {
    id: 'rec2',
    name: 'Sunset Bistro',
    category: 'Restaurant',
    rating: 4.5,
    distance: 1.2,
    imageUrl: 'https://i.pravatar.cc/300?img=21',
    description: 'French cuisine with a modern twist.',
    reason: 'Popular with your connections'
  },
  {
    id: 'rec3',
    name: 'City Gym',
    category: 'Fitness',
    rating: 4.8,
    distance: 0.8,
    imageUrl: 'https://i.pravatar.cc/300?img=22',
    description: 'Modern gym with the latest equipment.',
    reason: 'Matches your workout habits'
  }
];

interface RecommendationProps {
  userId?: string;
  location?: { lat: number; lng: number };
  preferences?: string[];
  maxItems?: number;
  className?: string;
}

const RecommendationEngine: React.FC<RecommendationProps> = ({
  userId,
  location,
  preferences,
  maxItems = 3,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { location: userLocation } = useLocation();

  // Function to handle navigation to place details
  const handlePlaceClick = (place: Place) => {
    navigate(`/place/${place.id}`);
  };

  // Function to refresh recommendations
  const refreshRecommendations = () => {
    fetchRecommendations();
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Use user's current location if not provided in props
      const currentLocation = location || userLocation || { lat: 34.052235, lng: -118.243683 };
      
      // Call Supabase Edge Function for AI recommendations
      const { data, error } = await supabase.functions.invoke('ai-recommendation', {
        body: {
          userId,
          location: currentLocation,
          preferences
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.recommendations) {
        // Apply maxItems limit
        setRecommendations(data.recommendations.slice(0, maxItems));
      } else {
        // Fallback to sample data if the function doesn't return expected format
        setRecommendations(sampleRecommendations.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Could not load recommendations',
        description: 'Using sample recommendations instead',
        variant: 'destructive',
      });
      setRecommendations(sampleRecommendations.slice(0, maxItems));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId, location, preferences, maxItems]);

  return (
    <Card className={className}>
      <CardContent className="p-5">
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(maxItems)].map((_, i) => (
              <div key={`skeleton-${i}`} className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-md flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="flex gap-4 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                onClick={() => handlePlaceClick(rec)}
              >
                <img 
                  src={rec.imageUrl} 
                  alt={rec.name} 
                  className="h-24 w-24 rounded-md object-cover flex-shrink-0" 
                />
                <div>
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{rec.name}</h3>
                    <span className="text-sm text-muted-foreground">{rec.distance} km</span>
                  </div>
                  <div className="flex items-center gap-2 my-1">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{rec.category}</span>
                    <span className="text-xs">★ {rec.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <p className="text-xs text-spotly-red mt-1">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          className="w-full mt-4 bg-gradient-to-r from-spotly-red to-spotly-blue text-white"
          onClick={refreshRecommendations}
        >
          Refresh Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;
