
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface IconFilterProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export const IconFilter: React.FC<IconFilterProps> = ({
  icon: Icon,
  label,
  isActive = false,
  onClick,
}) => {
  return (
    <div className="flex flex-col items-center space-y-1">
      <Button
        variant={isActive ? "default" : "secondary"}
        size="sm"
        className="h-14 w-14 rounded-full"
        onClick={onClick}
      >
        <Icon className="h-6 w-6" />
      </Button>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

export default IconFilter;
