
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { NotificationOptions } from '../types';
import { useToast } from './use-toast';

export function useNotifications() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const { toast } = useToast();
  
  // Initialize notification service
  useEffect(() => {
    const initNotifications = async () => {
      const supported = await notificationService.init();
      setIsSupported(supported);
      
      // Update permission status if supported
      if (supported) {
        setPermissionStatus(Notification.permission);
      }
    };
    
    initNotifications();
  }, []);
  
  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const granted = await notificationService.requestPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (granted) {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive notifications about important updates."
        });
      } else {
        toast({
          title: "Notifications disabled",
          description: "You won't receive notifications. You can enable them in your browser settings.",
          variant: "destructive"
        });
      }
      
      return granted;
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast({
        title: "Error",
        description: "Could not request notification permission.",
        variant: "destructive"
      });
      return false;
    }
  }, [isSupported, toast]);
  
  // Send a notification
  const sendNotification = useCallback(async (options: NotificationOptions) => {
    if (!isSupported) return false;
    
    return notificationService.sendNotification(options);
  }, [isSupported]);
  
  // Send a message notification
  const sendMessageNotification = useCallback(async (sender: string, message: string, avatarUrl?: string) => {
    if (!isSupported) return false;
    
    return notificationService.sendMessageNotification(sender, message, avatarUrl);
  }, [isSupported]);
  
  // Send an event reminder notification
  const sendEventReminderNotification = useCallback(async (eventTitle: string, eventTime: string, eventId: string) => {
    if (!isSupported) return false;
    
    return notificationService.sendEventReminderNotification(eventTitle, eventTime, eventId);
  }, [isSupported]);
  
  // Listen for service worker messages (e.g., quick replies)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'reply-action') {
        // Handle quick reply action
        console.log('Received quick reply action:', event.data);
        
        // You could automatically open a reply box in the UI
        // or navigate to the specific conversation
      }
    };
    
    if ('navigator' in window && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }
    
    return () => {
      if ('navigator' in window && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, []);
  
  return {
    isSupported,
    permissionStatus,
    requestPermission,
    sendNotification,
    sendMessageNotification,
    sendEventReminderNotification
  };
}
