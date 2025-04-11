
import React from 'react';
import { Bell, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const SettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Personal Information</h3>
          <p className="text-sm text-muted-foreground">
            Update your name, email, and phone number
          </p>
          <Button variant="outline" size="sm">Edit Profile</Button>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Control which notifications you receive
          </p>
          <Button variant="outline" size="sm" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Manage Notifications
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods and billing information
          </p>
          <Button variant="outline" size="sm" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Payment Methods
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
