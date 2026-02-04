'use client';

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
import { getCurrentUser, signOut } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';

const recentNotifications = [
  {
    id: 1,
    type: 'application',
    user: 'Stripe',
    message: 'Your application has moved to the next round',
    time: '2h ago',
    read: false,
    icon: Briefcase,
  },
  {
    id: 2,
    type: 'message',
    user: 'Sarah Chen',
    message: 'Sent you a message',
    time: '4h ago',
    read: false,
    icon: MessageSquare,
  },
  {
    id: 3,
    type: 'connection',
    user: 'Alex Rodriguez',
    message: 'Wants to connect with you',
    time: '1d ago',
    read: true,
    icon: UserPlus,
  },
];

const recentMessages = [
  {
    id: 1,
    user: 'Sarah Chen',
    avatar: 'https://github.com/shadcn.png',
    message: 'Hey! I saw your profile and would love to connect...',
    time: '2h ago',
    read: false,
  },
  {
    id: 2,
    user: 'Michael Brown',
    avatar: 'https://github.com/shadcn.png',
    message: 'Thanks for your application! We\'d like to schedule...',
    time: '5h ago',
    read: false,
  },
  {
    id: 3,
    user: 'Emma Wilson',
    avatar: 'https://github.com/shadcn.png',
    message: 'Following up on our last conversation about...',
    time: '1d ago',
    read: true,
  },
];

export function Header() {
  const currentUser = getCurrentUser();
  const router = useRouter();
  const unreadNotifCount = recentNotifications.filter(n => !n.read).length;
  const unreadMsgCount = recentMessages.filter(m => !m.read).length;

  const handleSignOut = () => {
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
                {recentMessages.map((msg) => (
                  <DropdownMenuItem
                    key={msg.id}
                    className={`flex items-start gap-3 p-3 cursor-pointer ${
                      !msg.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => router.push('/messages')}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={msg.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
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
                ))}
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
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-secondary">
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
                {recentNotifications.map((notif) => {
                  const Icon = notif.icon;
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
                })}
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
                  <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{currentUser?.name || 'Guest User'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email || 'No email'}</p>
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
