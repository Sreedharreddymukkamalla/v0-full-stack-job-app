'use client';

import { useEffect, useRef } from "react"
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
import { getUserConversations, getSupabaseClient } from '@/lib/supabase';
import { getProfile } from '@/lib/profileStore';
import { apiFetch } from '@/lib/api';

// messages will be loaded from API per conversation

export default function MessagesPage() {
  const [conversationList, setConversationList] = useState([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messagesForChat, setMessagesForChat] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mutedConversations, setMutedConversations] = useState<Set<number>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set());
  const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // track pending sends by content to avoid duplicate identical sends
  const pendingContentRef = useRef<Set<string>>(new Set());
  const selectedConversationRef = useRef<number | null>(selectedConversation || null);

  // keep ref in sync for realtime handlers
  useEffect(() => {
    selectedConversationRef.current = selectedConversation || null;
  }, [selectedConversation]);

  // Refresh conversations helper (reusable for initial load and realtime updates)
  const refreshConversations = async () => {
    try {
      const profile = getProfile();
      if (!profile) {
        setLoading(false);
        return;
      }
      const userId = profile.user_id ?? profile.id ?? profile.user?.id;
      const data = await getUserConversations(userId);
      if (data && Array.isArray(data)) {
        const mapped = data.map((c: any) => {
          const rawLast = c.last_message ?? c.lastMessage ?? c.preview ?? c.snippet ?? '';
          const lastMessage =
            typeof rawLast === 'string'
              ? rawLast
              : rawLast?.content ?? rawLast?.message ?? String(rawLast ?? '');
          const rawTs = c.timestamp ?? c.last_seen_at ?? c.updated_at ?? c.time ?? '';
          const timestamp = typeof rawTs === 'string' ? rawTs : rawTs?.created_at ?? String(rawTs ?? '');
          return {
            id: c.id,
            name: c.name || c.other_name || c.user?.name || c.display_name || '',
            role: c.role || c.title || c.user?.title || c.role_description || c.position || '',
            avatar: c.avatar || c.user?.avatar || c.avatar_url || '/placeholder.svg',
            lastMessage,
            timestamp,
            unread: Boolean(c.unread || c.unread_count || c.unreadMessages),
            online: Boolean(c.online || c.is_online || c.user?.online),
          };
        });
        setConversationList(mapped);
      }
    } catch (error) {
      console.error('[v0] Error refreshing conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversations from RPC on component mount
  useEffect(() => {
    void refreshConversations();
  }, []);

  // Check if we should open a specific conversation (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const messageUserId = sessionStorage.getItem('messageUserId');
      const messageUser = sessionStorage.getItem('messageUser');
      if (messageUserId) {
        // prefer explicit id when navigating from network page
        sessionStorage.removeItem('messageUserId');
        sessionStorage.removeItem('messageUser');
        const participantId = Number(messageUserId);
        if (!Number.isFinite(participantId)) return;
        void (async () => {
          try {
            const convo = await apiFetch<any>('/messages/conversations', {
              method: 'POST',
              json: { participant_id: participantId },
            });
            const convoId = convo?.id ?? convo?.conversation_id ?? convo;
            if (!convoId) return;
            const entry = {
              id: convoId,
              name: messageUser || `User ${participantId}`,
              role: '',
              avatar: '/placeholder.svg',
              lastMessage: '',
              timestamp: 'Just now',
              unread: 0,
              online: false,
            };
            setConversationList((prev) => {
              const without = prev.filter((c) => c.id !== entry.id);
              return [entry, ...without];
            });
            setSelectedConversation(convoId);
            try { markConversationRead(convoId); } catch {}
          } catch (e) {
            console.error('[v0] Failed to open conversation from network', e);
          }
        })();
      } else if (messageUser) {
        sessionStorage.removeItem('messageUser');
        const conv = conversationList.find((c: any) => c.name === messageUser || c.user?.name === messageUser);
        setSelectedConversation(conv?.id || 1);
      }
    }
  }, [conversationList]);

  // load messages for selected conversation
  useEffect(() => {
    const load = async () => {
      if (!selectedConversation) return;
      try {
        const msgs = await apiFetch<any[]>(`/messages/conversations/${selectedConversation}`);
        const mapped = msgs.map((m) => ({
          id: m.id,
          sender: m.sender_name || m.sender || m.sender_id || 'Unknown',
          content: m.content,
          timestamp: m.created_at ? new Date(m.created_at).toLocaleString() : '',
          isUser: Boolean(m.sender_id === (getProfile()?.user_id ?? getProfile()?.id)),
        }));
        setMessagesForChat(mapped);
      } catch (err) {
        console.error('[v0] Failed to load messages for conversation', selectedConversation, err);
        setMessagesForChat([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change or a conversation opens
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      // ignore
    }
  }, [messagesForChat, selectedConversation]);

  // Fetch connections for search
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const profile = getProfile();
        const userId = profile.user_id ?? profile.id ?? profile.user?.id;
        const cons = await apiFetch<any[]>('/connections');
        if (Array.isArray(cons)) {
          const formatted = cons
            .map((c) => {
              const otherId = c.requester_id === userId ? c.receiver_id : c.requester_id;
              return {
                id: Number(otherId ?? c.receiver_id ?? c.requester_id),
                name: c.other_name || `User ${otherId ?? ''}`,
                avatar: (c.other_avatar ? String(c.other_avatar) : '') || '/placeholder.svg',
                headline: c.other_headline || '',
              };
            })
            .filter((c) => c.id && Number.isFinite(c.id));
          setConnections(formatted);
        }
      } catch (e) {
        // ignore
      }
    };
    void fetchConnections();
  }, []);

  // Supabase realtime subscriptions for messages and conversations
  useEffect(() => {
    try {
      const client = getSupabaseClient();
      const profile = getProfile();
      const currentUserId = profile?.user_id ?? profile?.id ?? profile?.user?.id;

      const channel = client
        .channel('realtime-messaging')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          (payload: any) => {
            const ev = payload.eventType;
            const newRow = payload.new;
            const oldRow = payload.old;
            const convId = Number(newRow?.conversation_id ?? oldRow?.conversation_id);
            if (!convId) return;

            const mapRowToMsg = (row: any) => ({
              id: row.id,
              sender: row.sender_name || row.sender || row.sender_id,
              content: row.content,
              timestamp: row.created_at ? new Date(row.created_at).toLocaleString() : '',
            });

            if (ev === 'INSERT') {
              const msg = mapRowToMsg(newRow);
              const fromMe = Number(msg.sender) === Number(currentUserId);

              // Append to active chat if matches
              if (selectedConversationRef.current && Number(selectedConversationRef.current) === convId) {
                setMessagesForChat((prev) => {
                  if (prev.some((m) => m.id === msg.id)) return prev;
                  return [...prev, { ...msg, isUser: fromMe }];
                });
              }

              // Update conversation summary locally and refresh if missing
              setConversationList((prev) => {
                const found = prev.find((c) => Number(c.id) === convId);
                if (found) {
                  return prev.map((c) =>
                    Number(c.id) === convId
                      ? {
                          ...c,
                          lastMessage: msg.content,
                          timestamp: msg.timestamp,
                          unread: !fromMe ? (c.unread ? c.unread + 1 : 1) : c.unread,
                        }
                      : c
                  );
                }
                return prev;
              });

              // If we don't have the convo locally, refresh the list
              void refreshConversations();

              // If active and not from me, mark as read on server
              if (selectedConversationRef.current === convId && !fromMe) {
                void apiFetch(`/messages/conversations/${convId}/read`, { method: 'POST' });
                setConversationList((prev) => prev.map((c) => (Number(c.id) === convId ? { ...c, unread: 0 } : c)));
              }
            } else if (ev === 'UPDATE') {
              if (selectedConversationRef.current === convId) {
                void (async () => {
                  try {
                    const msgs = await apiFetch<any[]>(`/messages/conversations/${convId}`);
                    const mapped = msgs.map((m) => ({
                      id: m.id,
                      sender: m.sender_name || m.sender || m.sender_id || 'Unknown',
                      content: m.content,
                      timestamp: m.created_at ? new Date(m.created_at).toLocaleString() : '',
                      isUser: Boolean(m.sender_id === (getProfile()?.user_id ?? getProfile()?.id)),
                    }));
                    setMessagesForChat(mapped);
                  } catch (e) {
                    // ignore
                  }
                })();
              }
              setConversationList((prev) =>
                prev.map((c) =>
                  Number(c.id) === convId
                    ? {
                        ...c,
                        lastMessage: newRow?.content ?? c.lastMessage,
                        timestamp: newRow?.created_at ? new Date(newRow?.created_at).toLocaleString() : c.timestamp,
                      }
                    : c
                )
              );
            } else if (ev === 'DELETE') {
              setConversationList((prev) => prev.filter((c) => Number(c.id) !== convId));
              if (selectedConversationRef.current === convId) {
                setSelectedConversation(null);
                setMessagesForChat([]);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'conversations' },
          (payload: any) => {
            const ev = payload.eventType;
            const newRow = payload.new;
            const oldRow = payload.old;
            const convoId = Number(newRow?.id ?? oldRow?.id);
            if (!convoId) return;
            if (ev === 'INSERT' || ev === 'UPDATE') {
              // refresh conversation entry
              void refreshConversations();
            } else if (ev === 'DELETE') {
              setConversationList((prev) => prev.filter((c) => c.id !== convoId));
              if (selectedConversationRef.current === convoId) {
                setSelectedConversation(null);
                setMessagesForChat([]);
              }
            }
          }
        )
        .subscribe();

      return () => {
        try {
          channel.unsubscribe();
        } catch (e) {
          // ignore
        }
      };
    } catch (err) {
      console.error('[v0] Realtime subscription error', err);
    }
  }, []);

  const openOrCreateConversation = async (participant: any) => {
    if (!participant || !participant.id) return;
    try {
      const convo = await apiFetch<any>('/messages/conversations', {
        method: 'POST',
        json: { participant_id: participant.id },
      });
      const convoId = convo?.id ?? convo?.conversation_id ?? convo;
      if (!convoId) return;
      const entry = {
        id: convoId,
        name: participant.name,
        role: participant.headline || '',
        avatar: participant.avatar || '/placeholder.svg',
        lastMessage: '',
        timestamp: 'Just now',
        unread: 0,
        online: false,
      };
      setConversationList((prev) => {
        const without = prev.filter((c) => c.id !== entry.id);
        return [entry, ...without];
      });
      setSelectedConversation(convoId);
      // mark as read when opening
      try {
        markConversationRead(convoId);
      } catch {}
    } catch (err) {
      console.error('[v0] Failed to open/create conversation', err);
    }
  };

  const listToRender = (searchQuery || '').trim()
    ? connections.filter((c) => String(c.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : conversationList;

  const handleSendMessage = () => {
    const content = messageInput.trim();
    if (!content || !selectedConversation) return;
    // prevent duplicate identical sends while one is pending
    if (pendingContentRef.current.has(content)) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      sender: 'You',
      content,
      timestamp: new Date().toLocaleString(),
      isUser: true,
      pending: true,
    };

    // mark as pending and render immediately
    pendingContentRef.current.add(content);
    setMessagesForChat((prev) => [...prev, optimistic]);
    setMessageInput('');

    const send = async () => {
      try {
        const payload = { content };
        const msg = await apiFetch<any>(`/messages/conversations/${selectedConversation}/messages`, {
          method: 'POST',
          json: payload,
        });
        const mapped = {
          id: msg.id,
          sender: msg.sender_name || msg.sender || 'You',
          content: msg.content,
          timestamp: msg.created_at ? new Date(msg.created_at).toLocaleString() : new Date().toLocaleString(),
          isUser: true,
        };
        // replace optimistic message with server message
        setMessagesForChat((prev) => prev.map((m) => (m.id === tempId ? mapped : m)));
      } catch (err) {
        console.error('[v0] Failed to send message', err);
        // mark optimistic message as failed (remove pending flag)
        setMessagesForChat((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
      } finally {
        pendingContentRef.current.delete(content);
      }
    };
    void send();
  };

  const handleDeleteConversation = () => {
    const del = async () => {
      if (!selectedConversation) return;
      try {
        await apiFetch(`/messages/conversations/${selectedConversation}`, { method: 'DELETE' });
        setConversationList((prev) => prev.filter((c) => c.id !== selectedConversation));
        setSelectedConversation(conversationList[0]?.id || 0);
        setMessagesForChat([]);
        console.log('[v0] Deleted conversation:', selectedConversation);
      } catch (err) {
        console.error('[v0] Failed to delete conversation', err);
      }
    };
    void del();
  };

  const handleArchiveConversation = () => {
    const arch = async () => {
      if (!selectedConversation) return;
      try {
        await apiFetch(`/messages/conversations/${selectedConversation}/archive`, { method: 'POST' });
        setConversationList((prev) => prev.filter((c) => c.id !== selectedConversation));
        setSelectedConversation(conversationList[0]?.id || 0);
        setMessagesForChat([]);
      } catch (err) {
        // fallback to local behavior
        setConversationList((prev) => prev.filter((c) => c.id !== selectedConversation));
        console.error('[v0] Failed to archive conversation', err);
      }
    };
    void arch();
  };

  const handleMuteConversation = () => {
    const toggle = async () => {
      try {
        await apiFetch(`/messages/conversations/${selectedConversation}/mute`, { method: 'POST' });
        setMutedConversations((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(selectedConversation)) newSet.delete(selectedConversation);
          else newSet.add(selectedConversation);
          return newSet;
        });
      } catch (err) {
        // local fallback
        setMutedConversations((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(selectedConversation)) newSet.delete(selectedConversation);
          else newSet.add(selectedConversation);
          return newSet;
        });
      }
    };
    void toggle();
  };

  const handleBlockUser = () => {
    const blk = async () => {
      try {
        await apiFetch(`/messages/conversations/${selectedConversation}/block`, { method: 'POST' });
      } catch (err) {
        console.error('[v0] Failed to block user', err);
      }
      setBlockedUsers((prev) => new Set(prev).add(selectedConversation));
      setConversationList((prev) => prev.filter((c) => c.id !== selectedConversation));
    };
    void blk();
  };

  const markConversationRead = (conversationId?: number) => {
    if (!conversationId) return;
    void apiFetch(`/messages/conversations/${conversationId}/read`, { method: 'POST' }).catch(() => {});
    setConversationList((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)));
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log('[v0] Mark all as read')}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('[v0] Settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log('[v0] Archive all')}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          {listToRender.map((conv) => {
            const hasUnread = Number(conv.unread) > 0;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  if ((searchQuery || '').trim()) {
                    void openOrCreateConversation(conv);
                  } else {
                    setSelectedConversation(conv.id);
                    if (hasUnread) markConversationRead(conv.id);
                  }
                }}
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
                        {String(conv.name || '').split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold text-foreground truncate ${hasUnread ? 'text-primary' : ''}`}>
                        {conv.name}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{conv.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">{conv.role}</p>
                    <p className={`text-sm truncate ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {hasUnread && (
                    <Circle className="h-2.5 w-2.5 fill-primary text-primary flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            );
          })}
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
                    {selectedChat.online ? 'Active now' : 'Active now'}
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
              {messagesForChat.map((msg) => (
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
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-center gap-3">
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
