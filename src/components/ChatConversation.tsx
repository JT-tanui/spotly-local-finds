
import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  typingStatus?: boolean;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  messages,
  currentUserId,
  partnerProfile,
  isLoading = false,
  typingStatus = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: hasScrolled ? 'smooth' : 'auto' });
    setHasScrolled(true);
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingStatus]);
  
  // The early return was causing the hooks issue - we need to ensure all hooks are called
  // regardless of conditions. Let's render an empty component instead of returning null
  if (!currentUserId) {
    return (
      <ScrollArea className="flex-1 p-4 h-[400px]">
        <div className="space-y-3"></div>
      </ScrollArea>
    );
  }
  
  const groupedMessages = messages.reduce<{
    date: string;
    messages: Message[];
  }[]>((acc, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    const existingGroup = acc.find(group => group.date === date);
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      acc.push({ date, messages: [message] });
    }
    
    return acc;
  }, []);
  
  return (
    <ScrollArea className="flex-1 p-4 h-[400px]">
      <div className="space-y-4">
        {groupedMessages.map(group => (
          <div key={group.date} className="space-y-3">
            <div className="flex justify-center">
              <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
                {new Date(group.date).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            {group.messages.map(message => (
              <div 
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[75%] ${message.sender_id !== currentUserId ? 'flex-row' : 'flex-row-reverse'}`}>
                  {message.sender_id !== currentUserId && (
                    <Avatar className="h-6 w-6 hidden sm:flex">
                      <AvatarImage src={partnerProfile?.avatar_url} />
                      <AvatarFallback>{partnerProfile?.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={cn(
                      "px-4 py-2 rounded-lg",
                      message.sender_id === currentUserId 
                        ? "bg-spotly-red text-white rounded-tr-none" 
                        : "bg-slate-100 rounded-tl-none",
                      "transition-all hover:shadow-md"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse bg-slate-200 h-10 w-20 rounded-md"></div>
          </div>
        )}
        
        {typingStatus && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-slate-500">typing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatConversation;
