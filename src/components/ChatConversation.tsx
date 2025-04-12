
import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface ChatConversationProps {
  messages: Message[];
  currentUserId?: string;
  partner: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  messages,
  currentUserId,
  partner,
  newMessage,
  setNewMessage,
  handleSendMessage,
  onBack,
  showBackButton = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button variant="ghost" size="icon" className="mr-1" onClick={onBack}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </Button>
          )}
          <Avatar>
            <AvatarImage src={partner.avatar_url} />
            <AvatarFallback>{partner.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{partner.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {partner.username ? `@${partner.username}` : ""}
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
              className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] px-4 py-2 rounded-lg ${
                  message.sender_id === currentUserId 
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
          <div ref={messagesEndRef} />
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
  );
};

export default ChatConversation;
