
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { LocationData, NotificationOptions } from '@/types';

// Conditional import for push notifications
// This prevents build errors when the package isn't available yet
let PushNotificationsPlugin: any = null;
try {
  // Dynamic import for push notifications
  import('@capacitor/push-notifications').then(module => {
    PushNotificationsPlugin = module.PushNotifications;
  }).catch(err => {
    console.warn('Push notifications plugin not available:', err.message);
  });
} catch (error) {
  console.warn('Push notifications plugin not available');
}

export class CapacitorService {
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  static getPlatform(): string {
    return Capacitor.getPlatform();
  }

  static async getDeviceInfo() {
    return await Device.getInfo();
  }

  // Location methods
  static async getCurrentPosition(): Promise<LocationData | null> {
    try {
      if (!this.isNative()) {
        return null;
      }
      
      // Request permissions first
      const permissionStatus = await Geolocation.checkPermissions();
      
      if (permissionStatus.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          throw new Error('Location permission not granted');
        }
      }
      
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current position:', error);
      return null;
    }
  }

  // Push Notifications methods
  static async initializePushNotifications(): Promise<boolean> {
    if (!this.isNative() || !PushNotificationsPlugin) return false;
    
    try {
      // Request permission
      const permissionStatus = await PushNotificationsPlugin.requestPermissions();
      if (permissionStatus.receive !== 'granted') {
        return false;
      }
      
      // Register with FCM/APNs
      await PushNotificationsPlugin.register();
      
      // Setup listeners
      PushNotificationsPlugin.addListener('registration', (token: { value: string }) => {
        console.log('Push registration success, token: ', token.value);
      });
      
      PushNotificationsPlugin.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ', error);
      });
      
      PushNotificationsPlugin.addListener('pushNotificationReceived', 
        (notification: any) => {
          console.log('Push notification received: ', notification);
      });
      
      PushNotificationsPlugin.addListener('pushNotificationActionPerformed', 
        (notification: any) => {
          console.log('Push notification action performed: ', notification);
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }
  
  // Method to send local notification when in native app
  static async sendLocalNotification(options: NotificationOptions): Promise<boolean> {
    if (!this.isNative() || !PushNotificationsPlugin) return false;
    
    try {
      // We're using a mock implementation for now
      // In a real app, we would implement this using Capacitor's local notifications
      console.log('Would send notification:', options);
      return true;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return false;
    }
  }
}
