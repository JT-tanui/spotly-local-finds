
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Calendar, User, Users } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  metadata?: any;
  is_public: boolean;
  created_at: string;
}

interface NotificationsListProps {
  notifications: Notification[];
}

const NotificationsList: React.FC<NotificationsListProps> = ({ notifications }) => {
  const getNotificationContent = (notification: Notification) => {
    const { activity_type, metadata } = notification;
    
    switch (activity_type) {
      case 'reservation_confirmed':
        return (
          <>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-medium">Reservation confirmed</p>
              <p className="text-sm text-muted-foreground">
                Your reservation at {metadata?.place_name || 'a venue'} has been confirmed.
              </p>
            </div>
          </>
        );
        
      case 'friend_request':
        return (
          <>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">Friend request</p>
              <p className="text-sm text-muted-foreground">
                {metadata?.user_name || 'Someone'} sent you a friend request.
              </p>
            </div>
          </>
        );
        
      case 'event_invitation':
        return (
          <>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <Users size={20} />
            </div>
            <div>
              <p className="font-medium">Event invitation</p>
              <p className="text-sm text-muted-foreground">
                You've been invited to {metadata?.event_name || 'an event'}.
              </p>
            </div>
          </>
        );
        
      default:
        return (
          <>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mr-3">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-medium">New notification</p>
              <p className="text-sm text-muted-foreground">
                You have a new notification.
              </p>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className="space-y-3">
      {notifications.length > 0 ? (
        notifications.map(notification => (
          <div key={notification.id} className="border rounded-lg p-4">
            <div className="flex items-start">
              {getNotificationContent(notification)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
        ))
      ) : (
        <div className="border rounded-lg p-8 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium">No notifications</h3>
          <p className="text-sm text-muted-foreground">
            When you receive notifications, they'll appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
