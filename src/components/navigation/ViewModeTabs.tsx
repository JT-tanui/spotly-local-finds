
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewModeTabsProps {
  viewMode: string;
  onChange: (mode: string) => void;
  isMobile?: boolean;
}

const ViewModeTabs: React.FC<ViewModeTabsProps> = ({ viewMode, onChange, isMobile = false }) => {
  return (
    <Tabs 
      defaultValue={viewMode} 
      value={viewMode} 
      onValueChange={onChange} 
      className={isMobile ? "w-full" : "w-auto"}
    >
      <TabsList className={isMobile ? "w-full bg-muted/60" : "bg-muted/60"}>
        <TabsTrigger 
          value="standard" 
          className={isMobile ? "flex-1" : "px-6"}
        >
          Classic
        </TabsTrigger>
        <TabsTrigger 
          value="discover" 
          className={isMobile ? "flex-1" : "px-6"}
        >
          Discover
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ViewModeTabs;
