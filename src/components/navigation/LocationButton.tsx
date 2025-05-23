
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationButtonProps {
  location?: {
    city?: string;
    address?: string;
  };
}

const LocationButton: React.FC<LocationButtonProps> = ({ location }) => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="hidden md:flex items-center text-spotly-dark" 
      onClick={() => navigate('/location')}
    >
      <MapPin className="mr-1 h-4 w-4 text-spotly-red" />
      <span className="truncate max-w-[100px]">
        {location?.city || location?.address || "Set location"}
      </span>
    </Button>
  );
};

export default LocationButton;
