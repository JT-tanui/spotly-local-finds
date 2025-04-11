
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, PartyPopper, User, MoreHorizontal } from 'lucide-react';
import { Event, EventParticipant, Place } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { InvitePeopleForm } from './InvitePeopleForm';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  place: Place;
  isOwner: boolean;
  onUpdateEvent: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  place,
  isOwner,
  onUpdateEvent
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [currentUserStatus, setCurrentUserStatus] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
      checkCurrentUserStatus();
    }
  }, [isOpen, event.id]);
  
  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', event.id);
        
      if (error) throw error;
      
      // Convert raw data to EventParticipant type
      const typedParticipants: EventParticipant[] = data?.map(p => ({
        id: p.id,
        event_id: p.event_id,
        user_id: p.user_id,
        status: p.status as 'invited' | 'accepted' | 'declined' | 'maybe',
        created_at: p.created_at,
      })) || [];
      
      setParticipants(typedParticipants);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkCurrentUserStatus = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const { data } = await supabase
        .from('event_participants')
        .select('status')
        .eq('event_id', event.id)
        .eq('user_id', userData.user.id)
        .maybeSingle();
        
      if (data) {
        setCurrentUserStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };
  
  const updateAttendanceStatus = async (status: 'accepted' | 'declined' | 'maybe') => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to update your attendance",
          variant: "destructive"
        });
        return;
      }

      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', userData.user.id)
        .single();

      if (existingParticipant) {
        const { error } = await supabase
          .from('event_participants')
          .update({ status })
          .eq('id', existingParticipant.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            user_id: userData.user.id,
            status
          });

        if (error) throw error;
      }

      setCurrentUserStatus(status);
      toast({
        title: "Status updated",
        description: `You've ${status} this event`
      });
      
      fetchParticipants();
      onUpdateEvent();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Failed to update status",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const formatParticipantStatus = (status: string) => {
    switch (status) {
      case 'accepted': return 'Going';
      case 'declined': return 'Not Going';
      case 'maybe': return 'Maybe';
      case 'invited': return 'Invited';
      default: return status;
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800';
      case 'invited':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleInvitePeople = (emails: string[]) => {
    // In a real app, this would send invitations to the provided emails
    toast({
      title: "Invitations sent",
      description: `${emails.length} people have been invited to this event`
    });
    setShowInviteForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <div className="flex flex-col space-y-4">
            {/* Event Details */}
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 mr-3 mt-0.5 text-gray-500" />
                <div>
                  <div className="font-medium">{format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</div>
                  <div className="text-sm text-muted-foreground">{format(new Date(event.event_date), 'h:mm a')}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-500" />
                <div>
                  <div className="font-medium">{place.name}</div>
                  <div className="text-sm text-muted-foreground">{place.address || 'Address not available'}</div>
                </div>
              </div>
              
              {event.description && (
                <div className="mt-3 text-sm border-t pt-3">
                  {event.description}
                </div>
              )}
            </div>
            
            {/* Attendance Section */}
            <div>
              <h3 className="text-sm font-semibold flex items-center mb-2">
                <Users className="w-4 h-4 mr-2" />
                Attendees ({participants.filter(p => p.status === 'accepted').length})
              </h3>
              
              {loading ? (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Loading participants...</p>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto">
                  {participants.length > 0 ? (
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span>
                              {participant.user?.name || participant.user_id.substring(0, 8)}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(participant.status)}`}>
                            {formatParticipantStatus(participant.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No participants yet</p>
                  )}
                </div>
              )}
              
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => setShowInviteForm(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Invite People
                </Button>
              )}
            </div>
            
            {/* Action Buttons */}
            {!isOwner && event.status === 'active' && (
              <div className="border-t pt-3 flex justify-between">
                <div className="text-sm font-medium">
                  Your response:
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={currentUserStatus === 'accepted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateAttendanceStatus('accepted')}
                  >
                    Going
                  </Button>
                  <Button
                    variant={currentUserStatus === 'maybe' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateAttendanceStatus('maybe')}
                  >
                    Maybe
                  </Button>
                  <Button
                    variant={currentUserStatus === 'declined' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateAttendanceStatus('declined')}
                  >
                    Not Going
                  </Button>
                </div>
              </div>
            )}
            
            <div className="border-t pt-3 flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(`/place/${place.id}`)}
              >
                View Location
              </Button>
              
              {isOwner && event.status === 'active' && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('events')
                        .update({ status: 'cancelled' })
                        .eq('id', event.id);

                      if (error) throw error;

                      toast({
                        title: "Event cancelled",
                        description: "The event has been cancelled"
                      });
                      
                      onUpdateEvent();
                      onClose();
                    } catch (error) {
                      console.error('Error cancelling event:', error);
                      toast({
                        title: "Failed to cancel event",
                        description: "Please try again later",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Cancel Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      
      {showInviteForm && (
        <InvitePeopleForm
          isOpen={showInviteForm}
          onClose={() => setShowInviteForm(false)}
          onInvite={handleInvitePeople}
          eventId={event.id}
        />
      )}
    </Dialog>
  );
};

export default EventDetailsModal;
