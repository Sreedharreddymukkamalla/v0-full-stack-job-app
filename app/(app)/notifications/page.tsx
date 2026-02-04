'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Trash2 } from 'lucide-react';

const notifications = [
  {
    id: 1,
    type: 'application',
    user: 'Stripe',
    message: 'Your application has moved to the next round',
    subtext: 'Senior Frontend Engineer position',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'message',
    user: 'Sarah Chen',
    message: 'Sent you a message',
    subtext: '"That sounds great! Let\'s schedule a call..."',
    time: '4 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'connection',
    user: 'Alex Rodriguez',
    message: 'Wants to connect with you',
    subtext: 'Recruiter at TechCorp',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'job',
    user: 'AImploy',
    message: 'New job matching your skills',
    subtext: 'Product Designer at Figma',
    time: '2 days ago',
    read: true,
  },
  {
    id: 5,
    type: 'post',
    user: 'Jordan Tech',
    message: 'Liked your post',
    subtext: '"Tips for acing technical interviews"',
    time: '3 days ago',
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with what's happening</p>
          </div>
          <Button variant="outline" size="sm" className="bg-transparent">Mark all as read</Button>
        </div>

        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 border-border transition-colors ${
                !notif.read ? 'bg-muted/50 border-accent/30' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.user}`} />
                  <AvatarFallback>{notif.user.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {notif.user} <span className="font-normal text-muted-foreground">{notif.message}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{notif.subtext}</p>
                  <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {notif.type === 'connection' && (
                    <>
                      <Button size="sm">Accept</Button>
                      <Button size="sm" variant="outline">Decline</Button>
                    </>
                  )}
                  {notif.type === 'message' && (
                    <Button size="sm">Reply</Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
