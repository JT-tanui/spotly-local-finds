
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Phone, Video, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  onVideoCall?: (userId: string) => void;
  onVoiceCall?: (userId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  conversations,
  currentUserId,
  onSelectConversation,
  selectedConversationId,
  onVideoCall,
  onVoiceCall
}) => {
  return (
    <div className="divide-y">
      {conversations.length > 0 ? (
        conversations.map(conversation => (
          <div 
            key={conversation.user.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
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
              
              <div className="flex items-center gap-1">
                {onVoiceCall && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hidden sm:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVoiceCall(conversation.user.id);
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
                
                {onVideoCall && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hidden sm:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVideoCall(conversation.user.id);
                    }}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hidden sm:flex"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Mark as read</DropdownMenuItem>
                    <DropdownMenuItem>Mute conversation</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete conversation</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
