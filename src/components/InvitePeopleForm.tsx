
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvitePeopleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (emails: string[]) => void;
  eventId: string;
}

export const InvitePeopleForm: React.FC<InvitePeopleFormProps> = ({
  isOpen,
  onClose,
  onInvite,
  eventId
}) => {
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const handleAddEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = emailInput.trim();
    
    if (!trimmedEmail) return;
    
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (emails.includes(trimmedEmail)) {
      toast({
        title: "Duplicate email",
        description: "This email has already been added",
        variant: "destructive"
      });
      return;
    }
    
    setEmails([...emails, trimmedEmail]);
    setEmailInput('');
  };
  
  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailInput.trim()) {
      handleAddEmail();
    }
    
    if (emails.length === 0) {
      toast({
        title: "No emails added",
        description: "Please add at least one email to invite",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // In a real app, this would check if users exist in the system
      // and add them as participants with 'invited' status
      // For demo purposes, we'll just simulate this process
      
      toast({
        title: "Invitations sent",
        description: `${emails.length} ${emails.length === 1 ? 'person has' : 'people have'} been invited`
      });
      
      onInvite(emails);
      onClose();
    } catch (error) {
      console.error('Error inviting participants:', error);
      toast({
        title: "Failed to send invitations",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite People</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddEmail}
                className="ml-2"
              >
                Add
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Invitees</Label>
            <div className="border rounded-md p-2 min-h-[100px] max-h-[150px] overflow-y-auto">
              {emails.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {emails.map((email, index) => (
                    <div 
                      key={index} 
                      className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      <span className="mr-1">{email}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-blue-800 hover:text-blue-900 font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm p-2">
                  No invitees added yet
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Invitations'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
