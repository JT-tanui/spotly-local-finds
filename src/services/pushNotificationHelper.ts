
import { notificationService } from './notificationService';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  sender?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Event {
  id: string;
  title: string;
  event_date: string;
}

/**
 * A helper for scheduling and sending push notifications in the app
 */
export class PushNotificationHelper {
  /**
   * Check if we should send a notification for a message
   * (typically when the app is in background or the user is on a different page)
   */
  public static shouldSendMessageNotification(message: Message, currentUserId: string | undefined): boolean {
    // Don't notify for own messages
    if (message.sender_id === currentUserId) return false;
    
    // Check if app is visible
    if (document.visibilityState === 'visible') {
      // Only send notification if user isn't on the inbox page
      return !window.location.pathname.includes('/inbox');
    }
    
    // App is in background, always send notification
    return true;
  }
  
  /**
   * Send a notification for a new message
   */
  public static async sendNewMessageNotification(message: Message): Promise<void> {
    if (!message.sender) return;
    
    await notificationService.sendMessageNotification(
      message.sender.full_name || 'Someone',
      message.content,
      message.sender.avatar_url
    );
  }
  
  /**
   * Schedule an event reminder notification
   */
  public static scheduleEventReminder(event: Event, minutesBefore: number = 30): void {
    try {
      const eventDate = new Date(event.event_date);
      const reminderTime = new Date(eventDate.getTime() - (minutesBefore * 60 * 1000));
      const now = new Date();
      
      // If the reminder time is in the past, don't schedule
      if (reminderTime <= now) return;
      
      const delayMs = reminderTime.getTime() - now.getTime();
      
      // Schedule the reminder
      setTimeout(() => {
        notificationService.sendEventReminderNotification(
          event.title,
          eventDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          event.id
        );
      }, delayMs);
      
      // Store scheduled notification in local storage so it persists across page reloads
      const scheduledReminders = JSON.parse(localStorage.getItem('scheduledReminders') || '[]');
      scheduledReminders.push({
        eventId: event.id,
        reminderTime: reminderTime.toISOString(),
        title: event.title,
        eventTime: eventDate.toISOString()
      });
      localStorage.setItem('scheduledReminders', JSON.stringify(scheduledReminders));
    } catch (error) {
      console.error('Error scheduling event reminder:', error);
    }
  }
  
  /**
   * Load scheduled event reminders from localStorage
   * Call this when the app initializes
   */
  public static loadScheduledReminders(): void {
    try {
      const scheduledReminders = JSON.parse(localStorage.getItem('scheduledReminders') || '[]');
      const now = new Date();
      
      // Filter out past reminders
      const futureReminders = scheduledReminders.filter((reminder: any) => {
        return new Date(reminder.reminderTime) > now;
      });
      
      // Re-schedule future reminders
      futureReminders.forEach((reminder: any) => {
        const reminderTime = new Date(reminder.reminderTime);
        const delayMs = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
          notificationService.sendEventReminderNotification(
            reminder.title,
            new Date(reminder.eventTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            reminder.eventId
          );
        }, delayMs);
      });
      
      // Update localStorage with only future reminders
      localStorage.setItem('scheduledReminders', JSON.stringify(futureReminders));
    } catch (error) {
      console.error('Error loading scheduled reminders:', error);
    }
  }
}
