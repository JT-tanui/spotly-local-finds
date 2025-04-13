
/**
 * Push Notification Service
 * 
 * This service manages push notifications for the application.
 * It handles requesting permissions, registering service workers,
 * and sending notifications to the device.
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification service
   * Registers the service worker and checks permission
   */
  public async init(): Promise<boolean> {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers are not supported by this browser');
      return false;
    }

    try {
      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/notification-sw.js');
      
      // Update permission status
      this.permission = Notification.permission;
      
      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  /**
   * Request permission to show notifications
   */
  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if the browser has permission to show notifications
   */
  public hasPermission(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Send a notification
   */
  public async sendNotification(options: NotificationOptions): Promise<boolean> {
    if (!this.hasPermission()) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.log('Notification permission denied');
        return false;
      }
    }

    try {
      // If we have a service worker, use it to show the notification
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          badge: options.badge,
          tag: options.tag,
          data: options.data,
          actions: options.actions,
          requireInteraction: options.requireInteraction
        });
      } else {
        // Fallback to regular notification
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico'
        });
      }
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send a message reminder notification
   */
  public async sendMessageNotification(sender: string, message: string, avatarUrl?: string): Promise<boolean> {
    return this.sendNotification({
      title: `New message from ${sender}`,
      body: message.length > 100 ? `${message.substring(0, 97)}...` : message,
      icon: avatarUrl || '/favicon.ico',
      tag: 'message',
      data: { type: 'message', sender },
      actions: [
        {
          action: 'reply',
          title: 'Reply'
        },
        {
          action: 'view',
          title: 'View'
        }
      ]
    });
  }

  /**
   * Send an event reminder notification
   */
  public async sendEventReminderNotification(eventTitle: string, eventTime: string, eventId: string): Promise<boolean> {
    return this.sendNotification({
      title: `Reminder: ${eventTitle}`,
      body: `Your event starts at ${eventTime}`,
      tag: 'event',
      data: { type: 'event', eventId },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    });
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();
