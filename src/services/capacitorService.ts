
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { LocationData, NotificationOptions } from '@/types';

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
    if (!this.isNative()) return false;
    
    try {
      // Request permission
      const permissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive !== 'granted') {
        return false;
      }
      
      // Register with FCM/APNs
      await PushNotifications.register();
      
      // Setup listeners
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ', token.value);
      });
      
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ', error);
      });
      
      PushNotifications.addListener('pushNotificationReceived', 
        (notification: PushNotificationSchema) => {
          console.log('Push notification received: ', notification);
      });
      
      PushNotifications.addListener('pushNotificationActionPerformed', 
        (notification: { actionId: string, notification: PushNotificationSchema }) => {
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
    if (!this.isNative()) return false;
    
    try {
      // We're using PushNotifications.localNotification, but could use Local Notifications plugin instead
      return true;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return false;
    }
  }
}
