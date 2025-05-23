
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";

interface MobileMenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ to, icon, label, onClick, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-md ${
          isActive
            ? 'bg-slate-100 text-spotly-red font-medium'
            : 'text-spotly-dark'
        }`
      }
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {label}
      {badge !== undefined && (
        <Badge variant="destructive" className="ml-auto px-1 min-w-5 text-center">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

export default MobileMenuItem;
