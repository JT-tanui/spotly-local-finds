
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md transition-colors ${
          isActive
            ? 'bg-slate-100 text-spotly-red font-medium'
            : 'text-spotly-dark hover:bg-slate-50'
        }`
      }
    >
      <span className="mr-1">{icon}</span>
      {label}
      {badge !== undefined && (
        <Badge variant="destructive" className="ml-1.5 px-1 min-w-5 text-center">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

export default NavItem;
