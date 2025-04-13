
import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, MessageSquare, Calendar, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const NotificationPreferences = () => {
  const { isSupported, permissionStatus, requestPermission } = useNotifications();
  const [eventNotifications, setEventNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  
  // Determine if notifications are enabled in the browser
  const isNotificationsEnabled = permissionStatus === 'granted';
  
  // Example function to send a test notification when the user enables notifications
  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    
    if (granted) {
      // Show demo notification after a short delay
      setTimeout(() => {
        // This is just for demonstration purposes
        const demoEvent = new CustomEvent('demo-notification', {
          detail: { type: 'message', sender: 'Spotly', message: 'Notifications are now enabled! You will receive updates about messages and events.' }
        });
        window.dispatchEvent(demoEvent);
      }, 1500);
    }
  };
  
  // Demo notification handler (in a real app, this would come from a service)
  useEffect(() => {
    const handleDemoNotification = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      
      // This is a mock - in a real app, we'd use the notification service
      if (detail.type === 'message') {
        // We'd call our notification service here
        console.log('Would send notification:', detail);
      }
    };
    
    window.addEventListener('demo-notification', handleDemoNotification);
    
    return () => {
      window.removeEventListener('demo-notification', handleDemoNotification);
    };
  }, []);

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not supported</AlertTitle>
            <AlertDescription>
              Push notifications are not supported in your browser.
              Try using a modern browser like Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>Manage your notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isNotificationsEnabled && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Notifications are disabled</AlertTitle>
            <AlertDescription>
              Enable notifications to get updates about messages, events, and reminders.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <Label htmlFor="message-notifications">Message notifications</Label>
            </div>
            <Switch 
              id="message-notifications" 
              checked={messageNotifications && isNotificationsEnabled}
              disabled={!isNotificationsEnabled}
              onCheckedChange={setMessageNotifications} 
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <Label htmlFor="event-notifications">Event notifications</Label>
            </div>
            <Switch 
              id="event-notifications" 
              checked={eventNotifications && isNotificationsEnabled}
              disabled={!isNotificationsEnabled} 
              onCheckedChange={setEventNotifications} 
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <Label htmlFor="reminder-notifications">Reminder notifications</Label>
            </div>
            <Switch 
              id="reminder-notifications" 
              checked={reminderNotifications && isNotificationsEnabled}
              disabled={!isNotificationsEnabled} 
              onCheckedChange={setReminderNotifications} 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {!isNotificationsEnabled ? (
          <Button onClick={handleEnableNotifications} className="w-full">
            Enable Notifications
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Notifications are enabled. You'll receive updates based on your preferences.
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default NotificationPreferences;
