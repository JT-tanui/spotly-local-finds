
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Calendar, Users, MessageSquare, Heart, Star } from 'lucide-react';

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
  const renderNotificationContent = (notification: Notification) => {
    const { activity_type, metadata } = notification;
    
    switch (activity_type) {
      case 'reservation_confirmed':
        return (
          <>
            <Calendar className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-medium">Reservation confirmed</p>
              <p className="text-sm text-muted-foreground">
                Your reservation at {metadata?.place_name || 'the venue'} has been confirmed
              </p>
            </div>
          </>
        );
        
      case 'friend_request':
        return (
          <>
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">New friend request</p>
              <p className="text-sm text-muted-foreground">
                {metadata?.user_name || 'Someone'} sent you a friend request
              </p>
            </div>
          </>
        );
        
      case 'event_invitation':
        return (
          <>
            <Calendar className="h-8 w-8 text-purple-500" />
            <div>
              <p className="font-medium">Event invitation</p>
              <p className="text-sm text-muted-foreground">
                You've been invited to {metadata?.event_name || 'an event'}
              </p>
            </div>
          </>
        );
        
      case 'new_message':
        return (
          <>
            <MessageSquare className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="font-medium">New message</p>
              <p className="text-sm text-muted-foreground">
                {metadata?.sender_name || 'Someone'} sent you a message
              </p>
            </div>
          </>
        );
        
      case 'place_liked':
        return (
          <>
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <p className="font-medium">Place added to favorites</p>
              <p className="text-sm text-muted-foreground">
                You added {metadata?.place_name || 'a place'} to your favorites
              </p>
            </div>
          </>
        );
        
      case 'review_added':
        return (
          <>
            <Star className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="font-medium">Review published</p>
              <p className="text-sm text-muted-foreground">
                Your review for {metadata?.place_name || 'a place'} has been published
              </p>
            </div>
          </>
        );
        
      default:
        return (
          <>
            <Bell className="h-8 w-8 text-gray-500" />
            <div>
              <p className="font-medium">Notification</p>
              <p className="text-sm text-muted-foreground">
                You have a new notification
              </p>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <div key={notification.id} className="border rounded-lg p-4 hover:bg-slate-50">
          <div className="flex items-start gap-3">
            {renderNotificationContent(notification)}
            
            <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
