
import React from 'react';
import { Button } from "@/components/ui/button";
import { LucideIcon } from 'lucide-react';

interface IconFilterProps {
  isActive?: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

export const IconFilter: React.FC<IconFilterProps> = ({ 
  isActive = false, 
  onClick, 
  icon: Icon, 
  label 
}) => {
  return (
    <Button 
      variant={isActive ? "default" : "outline"} 
      size="sm" 
      onClick={onClick} 
      className="flex items-center space-x-2"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );
};
