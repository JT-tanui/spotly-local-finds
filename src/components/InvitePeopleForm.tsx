
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, MessageSquare, Phone, Plus, User, X } from 'lucide-react';

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
  const [phoneInput, setPhoneInput] = useState('');
  const [manualNameInput, setManualNameInput] = useState('');
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [phones, setPhones] = useState<string[]>([]);
  const [manualContacts, setManualContacts] = useState<{name: string, email: string}[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'sms' | 'manual'>('email');
  
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
  
  const handleAddPhone = () => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    const trimmedPhone = phoneInput.trim();
    
    if (!trimmedPhone) return;
    
    if (!phoneRegex.test(trimmedPhone)) {
      toast({
        title: "Invalid phone format",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }
    
    if (phones.includes(trimmedPhone)) {
      toast({
        title: "Duplicate phone",
        description: "This phone number has already been added",
        variant: "destructive"
      });
      return;
    }
    
    setPhones([...phones, trimmedPhone]);
    setPhoneInput('');
  };
  
  const handleAddManualContact = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedName = manualNameInput.trim();
    const trimmedEmail = manualEmailInput.trim();
    
    if (!trimmedName || !trimmedEmail) {
      toast({
        title: "Missing information",
        description: "Please enter both name and email",
        variant: "destructive"
      });
      return;
    }
    
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (manualContacts.some(contact => contact.email === trimmedEmail)) {
      toast({
        title: "Duplicate contact",
        description: "This contact has already been added",
        variant: "destructive"
      });
      return;
    }
    
    setManualContacts([...manualContacts, {name: trimmedName, email: trimmedEmail}]);
    setManualNameInput('');
    setManualEmailInput('');
  };
  
  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };
  
  const handleRemovePhone = (phone: string) => {
    setPhones(phones.filter(p => p !== phone));
  };
  
  const handleRemoveManualContact = (email: string) => {
    setManualContacts(manualContacts.filter(c => c.email !== email));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add any final inputs
    if (inviteMethod === 'email' && emailInput.trim()) {
      handleAddEmail();
    } else if (inviteMethod === 'sms' && phoneInput.trim()) {
      handleAddPhone();
    } else if (inviteMethod === 'manual' && manualNameInput.trim() && manualEmailInput.trim()) {
      handleAddManualContact();
    }
    
    let invitationsSent = false;
    setSubmitting(true);
    
    try {
      // Handle email invitations
      if (inviteMethod === 'email' && emails.length > 0) {
        // In a real app, this would insert into invitations table
        // and send emails via an edge function
        toast({
          title: "Email invitations sent",
          description: `${emails.length} ${emails.length === 1 ? 'person has' : 'people have'} been invited by email`
        });
        invitationsSent = true;
      }
      
      // Handle SMS invitations
      if (inviteMethod === 'sms' && phones.length > 0) {
        // In a real app, this would send SMS messages via an edge function
        toast({
          title: "SMS invitations sent",
          description: `${phones.length} ${phones.length === 1 ? 'person has' : 'people have'} been invited by SMS`
        });
        invitationsSent = true;
      }
      
      // Handle manual contact invitations
      if (inviteMethod === 'manual' && manualContacts.length > 0) {
        // In a real app, this would create user records or send invitations
        toast({
          title: "Manual invitations processed",
          description: `${manualContacts.length} ${manualContacts.length === 1 ? 'person has' : 'people have'} been added`
        });
        invitationsSent = true;
      }
      
      if (!invitationsSent) {
        toast({
          title: "No invitations sent",
          description: "Please add at least one contact to invite",
          variant: "destructive"
        });
        return;
      }
      
      onInvite(emails); // Pass emails to parent component
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
          <Tabs defaultValue="email" onValueChange={(value) => setInviteMethod(value as 'email' | 'sms' | 'manual')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms">
                <Phone className="w-4 h-4 mr-2" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="manual">
                <User className="w-4 h-4 mr-2" />
                Manual
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
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
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Email Invitees</Label>
                <div className="border rounded-md p-2 min-h-[100px] max-h-[150px] overflow-y-auto">
                  {emails.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {emails.map((email, index) => (
                        <div 
                          key={index} 
                          className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          <span className="mr-1">{email}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="text-blue-800 hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm p-2">
                      No email invitees added yet
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailMessage">Message (optional)</Label>
                <Textarea
                  id="emailMessage"
                  placeholder="Add a personal message to your invitation"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="sms" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number (with country code)"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddPhone}
                    className="ml-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Format: +1234567890</p>
              </div>
              
              <div className="space-y-2">
                <Label>SMS Recipients</Label>
                <div className="border rounded-md p-2 min-h-[100px] max-h-[150px] overflow-y-auto">
                  {phones.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {phones.map((phone, index) => (
                        <div 
                          key={index} 
                          className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm flex items-center"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          <span className="mr-1">{phone}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemovePhone(phone)}
                            className="text-green-800 hover:text-green-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm p-2">
                      No SMS recipients added yet
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smsMessage">Message (optional)</Label>
                <Textarea
                  id="smsMessage"
                  placeholder="Add a personal message to your invitation"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="resize-none"
                  rows={3}
                  maxLength={160}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {messageInput.length}/160
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="manualName">Name</Label>
                  <Input
                    id="manualName"
                    placeholder="Contact name"
                    value={manualNameInput}
                    onChange={(e) => setManualNameInput(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="manualEmail">Email</Label>
                  <Input
                    id="manualEmail"
                    type="email"
                    placeholder="Contact email"
                    value={manualEmailInput}
                    onChange={(e) => setManualEmailInput(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddManualContact}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
              
              <div className="space-y-2">
                <Label>Added Contacts</Label>
                <div className="border rounded-md p-2 min-h-[100px] max-h-[150px] overflow-y-auto">
                  {manualContacts.length > 0 ? (
                    <div className="space-y-2">
                      {manualContacts.map((contact, index) => (
                        <div 
                          key={index} 
                          className="bg-purple-100 text-purple-800 rounded-md px-3 py-2 text-sm flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-2" />
                            <span className="font-medium">{contact.name}</span>
                            <span className="mx-2 text-purple-400">•</span>
                            <span className="text-xs">{contact.email}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveManualContact(contact.email)}
                            className="text-purple-800 hover:text-purple-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm p-2">
                      No contacts added yet
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
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
