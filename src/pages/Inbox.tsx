
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsDesktop, useIsTablet, useIsMobile } from '@/hooks/useMediaQuery';
import { Bell, MessageSquare, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationsList from '@/components/NotificationsList';
import ChatList from '@/components/ChatList';
import ChatConversation from '@/components/ChatConversation';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type TabValue = 'notifications' | 'messages';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

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

interface Conversation {
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
}

const Inbox = () => {
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabValue>('messages');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (profile) {
      fetchNotificationsAndMessages();
    }
  }, [profile]);

  const fetchNotificationsAndMessages = async () => {
    setLoading(true);
    try {
      // Fetch notifications from activity_feed table
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (notificationsError) throw notificationsError;
      
      // Fetch messages involving the user
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name, avatar_url, username)
        `)
        .or(`recipient_id.eq.${user?.id},sender_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
      
      if (messagesError) throw messagesError;
      
      // Process notifications
      setNotifications(notificationsData || []);
      
      // Process messages and create conversations
      processMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching inbox data:', error);
      toast({
        title: "Couldn't load inbox",
        description: "Please try again later",
        variant: "destructive"
      });
      
      // Use mock data for demo
      setNotifications(getMockNotifications());
      processMessages(getMockMessages());
    } finally {
      setLoading(false);
    }
  };
  
  const processMessages = (messagesData: any[]) => {
    if (!messagesData.length || !user) {
      setConversations(getMockConversations());
      return;
    }
    
    // Group messages by conversation partner
    const conversationMap = new Map<string, Conversation>();
    
    messagesData.forEach(message => {
      const isIncoming = message.recipient_id === user.id;
      const partnerId = isIncoming ? message.sender_id : message.recipient_id;
      const partner = isIncoming ? message.sender : null;
      
      if (!conversationMap.has(partnerId)) {
        // New conversation
        conversationMap.set(partnerId, {
          user: {
            id: partnerId,
            full_name: partner?.full_name || 'Unknown User',
            avatar_url: partner?.avatar_url,
            username: partner?.username
          },
          unreadCount: isIncoming && !message.read ? 1 : 0
        });
      } else {
        // Existing conversation
        const conv = conversationMap.get(partnerId)!;
        
        // Count unread messages
        if (isIncoming && !message.read) {
          conv.unreadCount += 1;
        }
        
        conversationMap.set(partnerId, conv);
      }
      
      // Set last message for conversation
      const conv = conversationMap.get(partnerId)!;
      if (!conv.lastMessage || new Date(message.created_at) > new Date(conv.lastMessage.created_at)) {
        conv.lastMessage = message;
      }
    });
    
    setConversations(Array.from(conversationMap.values()));
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    try {
      const message = {
        sender_id: user.id,
        recipient_id: selectedConversation.user.id,
        content: newMessage.trim(),
        read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select();
      
      if (error) throw error;
      
      // Optimistically update UI
      setMessages(prev => [...prev, {...message, id: data?.[0]?.id || 'temp-id', created_at: new Date().toISOString()}]);
      setNewMessage('');
      
      // Refresh conversations
      fetchNotificationsAndMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]); // Clear current messages
    
    try {
      // Fetch conversation messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${conversation.user.id}),and(sender_id.eq.${conversation.user.id},recipient_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data || getMockConversationMessages(conversation.user.id));
      
      // Mark messages as read
      if (data?.some(msg => msg.recipient_id === user?.id && !msg.read)) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('recipient_id', user?.id)
          .eq('sender_id', conversation.user.id);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setMessages(getMockConversationMessages(conversation.user.id));
    }
  };
  
  // Mock data generators for demo purposes
  const getMockNotifications = (): Notification[] => [
    {
      id: '1',
      user_id: 'mock-user',
      activity_type: 'reservation_confirmed',
      entity_type: 'reservation',
      entity_id: '123',
      metadata: { place_name: 'Sunset Cafe' },
      is_public: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      user_id: 'mock-user',
      activity_type: 'friend_request',
      entity_type: 'user',
      entity_id: '456',
      metadata: { user_name: 'John Smith' },
      is_public: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      user_id: 'mock-user',
      activity_type: 'event_invitation',
      entity_type: 'event',
      entity_id: '789',
      metadata: { event_name: 'Weekend Hiking Trip' },
      is_public: true,
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  const getMockMessages = (): Message[] => [
    {
      id: '1',
      sender_id: 'user-1',
      recipient_id: 'mock-user',
      content: "Hey there! Are we still on for tomorrow?",
      read: false,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      sender: {
        full_name: 'Emily Johnson',
        avatar_url: 'https://i.pravatar.cc/150?img=1'
      }
    },
    {
      id: '2',
      sender_id: 'user-2',
      recipient_id: 'mock-user',
      content: "Thanks for accepting my friend request!",
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      sender: {
        full_name: 'Michael Chen',
        avatar_url: 'https://i.pravatar.cc/150?img=3'
      }
    },
    {
      id: '3',
      sender_id: 'mock-user',
      recipient_id: 'user-3',
      content: "Let me know when you've booked the reservation.",
      read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      sender: {
        full_name: 'Sarah Johnson',
        avatar_url: 'https://i.pravatar.cc/150?img=23'
      }
    }
  ];
  
  const getMockConversations = (): Conversation[] => [
    {
      user: {
        id: 'user-1',
        full_name: 'Emily Johnson',
        avatar_url: 'https://i.pravatar.cc/150?img=1'
      },
      lastMessage: {
        id: '1',
        sender_id: 'user-1',
        recipient_id: 'mock-user',
        content: "Hey there! Are we still on for tomorrow?",
        read: false,
        created_at: new Date(Date.now() - 1800000).toISOString()
      },
      unreadCount: 1
    },
    {
      user: {
        id: 'user-2',
        full_name: 'Michael Chen',
        avatar_url: 'https://i.pravatar.cc/150?img=3'
      },
      lastMessage: {
        id: '2',
        sender_id: 'user-2',
        recipient_id: 'mock-user',
        content: "Thanks for accepting my friend request!",
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      unreadCount: 0
    },
    {
      user: {
        id: 'user-3',
        full_name: 'Alex Rodriguez',
        avatar_url: 'https://i.pravatar.cc/150?img=5'
      },
      lastMessage: {
        id: '3',
        sender_id: 'mock-user',
        recipient_id: 'user-3',
        content: "Let me know when you've booked the reservation.",
        read: true,
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      unreadCount: 0
    }
  ];
  
  const getMockConversationMessages = (userId: string): Message[] => [
    {
      id: '101',
      sender_id: 'mock-user',
      recipient_id: userId,
      content: "Hi there! How are you?",
      read: true,
      created_at: new Date(Date.now() - 360000).toISOString()
    },
    {
      id: '102',
      sender_id: userId,
      recipient_id: 'mock-user',
      content: "I'm good, thanks! Just checking about our plans.",
      read: true,
      created_at: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '103',
      sender_id: 'mock-user',
      recipient_id: userId,
      content: "Yes, I'm still planning to come. What time should we meet?",
      read: true,
      created_at: new Date(Date.now() - 240000).toISOString()
    },
    {
      id: '104',
      sender_id: userId,
      recipient_id: 'mock-user',
      content: "Great! Let's meet at 7pm at the restaurant.",
      read: true,
      created_at: new Date(Date.now() - 180000).toISOString()
    },
    {
      id: '105',
      sender_id: 'mock-user',
      recipient_id: userId,
      content: "Perfect. Looking forward to it!",
      read: true,
      created_at: new Date(Date.now() - 120000).toISOString()
    }
  ];
  
  const filteredConversations = searchQuery.trim().length > 0
    ? conversations.filter(conv => 
        conv.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage && conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())))
    : conversations;

  return (
    <div className={`${isMobile ? 'pt-4' : 'pt-[62px]'} pb-20 px-4`}>
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="messages">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages">
          <div className="w-full mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className={`flex ${isDesktop ? 'space-x-4' : 'flex-col'}`}>
            {/* Conversations List */}
            <div className={`${isDesktop ? 'w-1/3' : 'w-full'} border rounded-lg overflow-hidden ${selectedConversation && !isDesktop ? 'hidden' : ''}`}>
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="space-y-3 p-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-4/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div>
                    {filteredConversations.map(conversation => (
                      <div 
                        key={conversation.user.id} 
                        onClick={() => handleSelectConversation(conversation)}
                        className={`p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0 ${
                          selectedConversation?.user.id === conversation.user.id ? 'bg-slate-100' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.user.avatar_url} />
                              <AvatarFallback>{conversation.user.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-spotly-red text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">{conversation.user.full_name}</p>
                              {conversation.lastMessage && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            
                            {conversation.lastMessage && (
                              <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                                {conversation.lastMessage.sender_id === user?.id ? 'You: ' : ''}
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium">No conversations yet</h3>
                    <p className="text-sm text-muted-foreground">Start chatting with your connections</p>
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Chat Area */}
            <div className={`${isDesktop ? 'w-2/3' : 'w-full'} border rounded-lg overflow-hidden ${!selectedConversation && !isDesktop ? 'hidden' : ''}`}>
              {selectedConversation ? (
                <div className="flex flex-col h-[500px]">
                  {/* Chat Header */}
                  <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {!isDesktop && (
                        <Button variant="ghost" size="icon" className="mr-1" onClick={() => setSelectedConversation(null)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                            <path d="m15 18-6-6 6-6"/>
                          </svg>
                        </Button>
                      )}
                      <Avatar>
                        <AvatarImage src={selectedConversation.user.avatar_url} />
                        <AvatarFallback>{selectedConversation.user.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedConversation.user.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedConversation.user.username ? `@${selectedConversation.user.username}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[75%] px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id 
                                ? 'bg-spotly-red text-white rounded-tr-none' 
                                : 'bg-slate-100 rounded-tl-none'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="border-t p-3">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center p-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No conversation selected</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Select a conversation from the list or start a new one
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <NotificationsList notifications={notifications} />
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                When you receive notifications, they'll appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inbox;
