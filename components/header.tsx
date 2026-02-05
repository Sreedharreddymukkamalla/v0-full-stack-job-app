 'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, Bell, Plus, Menu, User, Settings, LogOut, MessageSquare, UserPlus, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth';
import { getProfile, loadProfileFromApi, clearProfile } from '@/lib/profileStore';
import { getUserConversations, getSupabaseClient } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const [currentUser, setCurrentUser] = useState<any>(() => getProfile());
  const router = useRouter();
  const [recentMsgsState, setRecentMsgsState] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const unreadNotifCount = notificationsList.filter(n => !n.read).length;
  const unreadMsgCount = recentMsgsState.filter(m => !m.read).length;
  const unreadMsgs = recentMsgsState.filter((m) => !m.read);

  useEffect(() => {
    if (!currentUser) {
      loadProfileFromApi().then((p) => {
        if (p) setCurrentUser(p);
      }).catch(() => null);
    }
  }, []);

  // subscribe to notifications realtime for current user
  useEffect(() => {
    let chan: any;
    try {
      const profile = getProfile();
      const userId = profile?.user_id ?? profile?.id ?? profile?.user?.id;
      if (!userId) return;
      const client = getSupabaseClient();
      const normalize = (row: any) => ({
        id: row.id,
        type: row.type || row.notification_type || 'notification',
        user: row.user || row.source_name || row.actor || 'System',
        message: row.message || row.text || row.body || '',
        time: row.created_at || row.time || '',
        read: Boolean(row.read),
      });

      chan = client
        .channel(`public:notifications:user:${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          (payload: any) => {
            try {
              const row = payload.new as any;
              const item = normalize(row);
              setNotificationsList((prev) => [item, ...prev]);
            } catch (err) {
              // ignore
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          (payload: any) => {
            try {
              const row = payload.new as any;
              const item = normalize(row);
              setNotificationsList((prev) => prev.map((n) => (n.id === item.id ? item : n)));
            } catch (err) {
              // ignore
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          (payload: any) => {
            try {
              const oldRow = payload.old as any;
              setNotificationsList((prev) => prev.filter((n) => n.id !== oldRow.id));
            } catch (err) {
              // ignore
            }
          }
        )
        .subscribe();
    } catch (e) {
      // ignore if supabase not configured
    }

    return () => {
      try {
        chan?.unsubscribe();
      } catch (e) {}
    };
  }, []);

    // load recent conversations/messages and subscribe to realtime updates
    useEffect(() => {
      let channel: any;
      const loadRecent = async () => {
        try {
          const profile = getProfile();
          if (!profile) return;
          const userId = profile.user_id ?? profile.id ?? profile.user?.id;
          const data = await getUserConversations(userId);
          if (Array.isArray(data)) {
            const mapped = data.slice(0, 10).map((c: any) => ({
              id: c.id,
              user: c.name || c.other_name || `Conversation ${c.id}`,
              avatar: c.avatar || c.user?.avatar || '/placeholder.svg',
              message: c.last_message ?? c.lastMessage ?? c.preview ?? '',
              time: c.timestamp ?? c.last_message_at ?? '',
              read: !Boolean(c.unread || c.unread_count || c.unreadMessages),
            }));
            setRecentMsgsState(mapped);
          }
        } catch (e) {
          // ignore
        }
      };

      loadRecent();

      try {
        const client = getSupabaseClient();
        channel = client
          .channel('header-realtime')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
            const newRow = payload.new;
            const convId = Number(newRow?.conversation_id);
            if (!convId) return;
            setRecentMsgsState((prev) => {
              const idx = prev.findIndex((p) => Number(p.id) === convId);
              const updatedItem = {
                id: convId,
                user: prev[idx]?.user || `Conversation ${convId}`,
                avatar: prev[idx]?.avatar || '/placeholder.svg',
                message: newRow.content,
                time: newRow.created_at ? new Date(newRow.created_at).toLocaleString() : '',
                read: false,
              };
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = updatedItem;
                // move to front
                copy.unshift(copy.splice(idx, 1)[0]);
                return copy;
              }
              // prepend new conversation entry
              return [updatedItem, ...prev].slice(0, 10);
            });
          })
          .subscribe();
      } catch (e) {
        // ignore realtime if not configured
      }

      return () => {
        try {
          channel?.unsubscribe();
        } catch (e) {}
      };
    }, []);

  const handleSignOut = () => {
    // clear in-memory profile and auth tokens
    try { clearProfile(); } catch (e) {}
    signOut();
    router.push('/signin');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3 flex-1">
          <SidebarTrigger className="md:hidden h-9 w-9">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs, people, companies..."
                className="pl-10 h-10 bg-secondary/50 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-secondary">
                <MessageSquare className="h-5 w-5" />
                {unreadMsgCount > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Messages</span>
                {unreadMsgCount > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {unreadMsgCount} unread
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                {unreadMsgs.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No unread messages</div>
                ) : (
                  unreadMsgs.map((msg) => (
                  <DropdownMenuItem
                    key={msg.id}
                    className={`flex items-start gap-3 p-3 cursor-pointer ${
                      !msg.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      try {
                        if (msg.id) sessionStorage.setItem('messageUserId', String(msg.id));
                        sessionStorage.setItem('messageUser', msg.user || '');
                      } catch {}
                      router.push('/messages');
                    }}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={msg.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{String(msg.user || '').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{msg.user}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                    </div>
                    {!msg.read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/messages" className="flex items-center justify-center cursor-pointer font-medium text-primary">
                  View all messages
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent">
                <Bell className="h-5 w-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadNotifCount > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {unreadNotifCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                {notificationsList.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No new notifications</div>
                ) : (
                  notificationsList.map((notif) => {
                    const Icon = notif.icon ?? (notif.type === 'application' ? Briefcase : notif.type === 'message' ? MessageSquare : notif.type === 'connection' ? UserPlus : Bell);
                    return (
                      <DropdownMenuItem
                        key={notif.id}
                        className={`flex items-start gap-3 p-3 cursor-pointer ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => router.push('/notifications')}
                      >
                        <div className="mt-0.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notif.user}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="flex items-center justify-center cursor-pointer font-medium text-primary">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9 ring-2 ring-border hover:ring-primary/50 transition-all cursor-pointer">
                  <AvatarImage src={currentUser?.avatar_url || currentUser?.avatar || currentUser?.other_avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {(currentUser?.full_name || currentUser?.name || currentUser?.user?.full_name || 'U')?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser?.full_name || currentUser?.name || currentUser?.user?.full_name || 'Guest User'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email || currentUser?.user?.email || 'No email'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
