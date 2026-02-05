'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, Bell, Plus, Menu, User, Settings, LogOut, MessageSquare, UserPlus, Briefcase, Triangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
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
  const { open } = useSidebar();
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
      } catch (e) { }
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
              user: newRow.sender_id || `Conversation ${convId}`,
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
      } catch (e) { }
    };
  }, []);

  const handleSignOut = () => {
    // clear in-memory profile and auth tokens
    try { clearProfile(); } catch (e) { }
    signOut();
    router.push('/signin');
  };

  return (
    <header className="sticky top-0 z-40 w-screen border-b border-border bg-background">
      {/* Top Bar - Logo and Search */}
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 border-b border-border">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8">
            <Triangle className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Right: Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-10 h-10 bg-background border border-border rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar - AIMPLOY Text and Actions */}
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <span className="text-base font-semibold text-foreground">AIMPLOY</span>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-4 w-4" />
            {unreadNotifCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive">
                {unreadNotifCount}
              </Badge>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.profile_image_url || currentUser?.avatar} />
                  <AvatarFallback className="text-xs">{currentUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                {currentUser?.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
