
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
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

interface ChatListProps {
  conversations: Conversation[];
  currentUserId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

const ChatList: React.FC<ChatListProps> = ({
  conversations,
  currentUserId,
  onSelectConversation,
  selectedConversationId
}) => {
  return (
    <div className="divide-y">
      {conversations.length > 0 ? (
        conversations.map(conversation => (
          <div 
            key={conversation.user.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-3 hover:bg-slate-50 cursor-pointer ${
              selectedConversationId === conversation.user.id ? 'bg-slate-100' : ''
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
                      {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
                
                {conversation.lastMessage && (
                  <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    {conversation.lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium">No conversations yet</h3>
          <p className="text-sm text-muted-foreground">Start chatting with your connections</p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
