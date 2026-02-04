'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Paperclip, 
  Search,
  MoreVertical,
  CheckCheck,
  Circle,
  Trash2,
  Archive,
  Volume2,
  UserMinus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const conversations = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Product Manager at Vercel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    lastMessage: "That sounds great! Let's schedule a call...",
    timestamp: '2 min',
    unread: true,
    online: true,
  },
  {
    id: 2,
    name: 'Alex Rodriguez',
    role: 'Recruiter at Stripe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    lastMessage: "Thanks for applying! We'd love to...",
    timestamp: '1 hour',
    unread: false,
    online: true,
  },
  {
    id: 3,
    name: 'Jordan Tech',
    role: 'Senior Developer at Google',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    lastMessage: 'Your portfolio is impressive!',
    timestamp: 'Yesterday',
    unread: false,
    online: false,
  },
  {
    id: 4,
    name: 'Emily Watson',
    role: 'CTO at Startup',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    lastMessage: 'Looking forward to our meeting',
    timestamp: '2 days',
    unread: false,
    online: false,
  },
];

const messages = [
  {
    id: 1,
    sender: 'Sarah Chen',
    content: "Hi! I saw your profile and I'm really impressed with your work on the AI dashboard project.",
    timestamp: '2:30 PM',
    isUser: false,
  },
  {
    id: 2,
    sender: 'You',
    content: "Thank you so much! I'm very interested in the opportunity at Vercel. The product is amazing.",
    timestamp: '2:35 PM',
    isUser: true,
  },
  {
    id: 3,
    sender: 'Sarah Chen',
    content: "That's great to hear! We're looking for someone with your exact skill set. Would you be available for a quick call this week?",
    timestamp: '2:38 PM',
    isUser: false,
  },
  {
    id: 4,
    sender: 'You',
    content: "Absolutely! I'm free Thursday afternoon or Friday morning. What works best for you?",
    timestamp: '2:40 PM',
    isUser: true,
  },
  {
    id: 5,
    sender: 'Sarah Chen',
    content: "That sounds great! Let's schedule a call for Thursday at 2 PM. I'll send you a calendar invite shortly.",
    timestamp: '2:42 PM',
    isUser: false,
  },
];

export default function MessagesPage() {
  const [conversationList, setConversationList] = useState(conversations);
  const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mutedConversations, setMutedConversations] = useState<Set<number>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set());

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  const handleDeleteConversation = () => {
    setConversationList(prev => prev.filter(c => c.id !== selectedConversation));
    setSelectedConversation(conversationList[0]?.id || 0);
    console.log('[v0] Deleted conversation:', selectedConversation);
  };

  const handleArchiveConversation = () => {
    setConversationList(prev => prev.filter(c => c.id !== selectedConversation));
    console.log('[v0] Archived conversation:', selectedConversation);
  };

  const handleMuteConversation = () => {
    setMutedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(selectedConversation)) {
        newSet.delete(selectedConversation);
        console.log('[v0] Unmuted conversation:', selectedConversation);
      } else {
        newSet.add(selectedConversation);
        console.log('[v0] Muted conversation:', selectedConversation);
      }
      return newSet;
    });
  };

  const handleBlockUser = () => {
    setBlockedUsers(prev => new Set(prev).add(selectedConversation));
    setConversationList(prev => prev.filter(c => c.id !== selectedConversation));
    console.log('[v0] Blocked user:', selectedConversation);
  };

  const selectedChat = conversationList.find(c => c.id === selectedConversation);
  const isMuted = mutedConversations.has(selectedConversation);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className="w-full md:w-96 border-r border-border bg-card flex flex-col">
        <div className="p-5 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Messages</h2>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-secondary/50 border-0 focus:bg-background"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationList.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full p-4 text-left transition-all duration-200 border-b border-border/50 ${
                selectedConversation === conv.id
                  ? 'bg-primary/5 border-l-2 border-l-primary'
                  : 'hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-border">
                    <AvatarImage src={conv.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {conv.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-foreground truncate ${conv.unread ? 'text-primary' : ''}`}>
                      {conv.name}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1">{conv.role}</p>
                  <p className={`text-sm truncate ${conv.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread && (
                  <Circle className="h-2.5 w-2.5 fill-primary text-primary flex-shrink-0 mt-1" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-background">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] border-b border-border bg-card px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-11 w-11 ring-2 ring-border">
                    <AvatarImage src={selectedChat.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {selectedChat.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground">{selectedChat.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.online ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-secondary">
                      <MoreVertical className="h-[18px] w-[18px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={handleArchiveConversation}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={handleMuteConversation}
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      {isMuted ? 'Unmute' : 'Mute'} notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={handleBlockUser}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Block user
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={handleDeleteConversation}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-secondary/20">
              <div className="text-center text-xs text-muted-foreground py-4">
                <span className="bg-background px-3 py-1 rounded-full">Today</span>
              </div>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 shadow-sm ${
                      msg.isUser
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                        : 'bg-card text-foreground rounded-2xl rounded-bl-md border border-border/50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1.5 mt-2 ${msg.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      <span className="text-[10px]">{msg.timestamp}</span>
                      {msg.isUser && <CheckCheck className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-secondary flex-shrink-0">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="h-11 rounded-xl border-border/50 bg-secondary/30 focus:bg-background"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="h-10 w-10 rounded-xl shadow-sm flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-secondary/20">
            <div className="text-center">
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
