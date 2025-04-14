import { NotificationOptions } from '@/types';

export const notificationService = {
  init: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered with scope:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    
    return true;
  },
  
  requestPermission: async (): Promise<boolean> => {
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },
  
  sendNotification: async (options: NotificationOptions): Promise<boolean> => {
    try {
      if (Notification.permission === 'granted') {
        await navigator.serviceWorker.ready;
        
        // Ensure title and body are defined
        if (!options.title || !options.body) {
          console.error('Notification title and body are required.');
          return false;
        }
        
        self.registration.showNotification(options.title, options);
        return true;
      } else {
        console.warn('Notification permission not granted');
        return false;
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },
  
  sendMessageNotification: async (sender: string, message: string, avatarUrl?: string): Promise<boolean> => {
    const options: NotificationOptions = {
      title: `New message from ${sender}`,
      body: message,
      icon: avatarUrl || '/favicon.ico',
      tag: 'new-message',
      data: {
        type: 'message',
        sender: sender,
        message: message
      },
      actions: [
        { action: 'reply', title: 'Reply', icon: '/icons/reply.png' },
        { action: 'view', title: 'View', icon: '/icons/view.png' }
      ],
      requireInteraction: false
    };
    
    return notificationService.sendNotification(options);
  },
  
  sendEventReminderNotification: async (eventTitle: string, eventTime: string, eventId: string): Promise<boolean> => {
    const options: NotificationOptions = {
      title: 'Event Reminder',
      body: `Upcoming event: ${eventTitle} at ${eventTime}`,
      icon: '/favicon.ico',
      tag: 'event-reminder',
      data: {
        type: 'event',
        eventId: eventId
      },
      actions: [
        { action: 'view', title: 'View Event', icon: '/icons/view.png' }
      ],
      requireInteraction: true
    };
    
    return notificationService.sendNotification(options);
  },
};
