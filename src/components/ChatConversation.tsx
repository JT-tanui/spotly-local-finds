
import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
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
  partnerProfile?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  isLoading?: boolean;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  messages,
  currentUserId,
  partnerProfile,
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // The early return was causing the hooks issue - we need to ensure all hooks are called
  // regardless of conditions. Let's render an empty component instead of returning null
  if (!currentUserId) {
    return (
      <ScrollArea className="flex-1 p-4 h-[400px]">
        <div className="space-y-3"></div>
      </ScrollArea>
    );
  }
  
  return (
    <ScrollArea className="flex-1 p-4 h-[400px]">
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
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse bg-slate-200 h-10 w-20 rounded-md"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatConversation;
