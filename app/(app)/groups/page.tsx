'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Plus } from 'lucide-react';

const groups = [
  {
    id: 1,
    name: 'React Community',
    description: 'Discuss React best practices, share projects, and help each other learn',
    members: 2500,
    avatar: 'RC',
    joined: true,
  },
  {
    id: 2,
    name: 'Tech Career Growth',
    description: 'Share career advice, job hunting tips, and interview experiences',
    members: 1800,
    avatar: 'TCG',
    joined: true,
  },
  {
    id: 3,
    name: 'Web Performance',
    description: 'Deep dive into web performance optimization and best practices',
    members: 950,
    avatar: 'WP',
    joined: false,
  },
  {
    id: 4,
    name: 'Startup Founders',
    description: 'Connect with other founders and discuss startup challenges',
    members: 1200,
    avatar: 'SF',
    joined: false,
  },
];

export default function GroupsPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Groups</h1>
            <p className="text-muted-foreground">Join communities and connect with like-minded professionals</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="p-6 border-border hover:border-accent/50 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  {group.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground truncate">{group.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.members} members
                </div>
              </div>

              <div className="flex gap-2">
                {group.joined ? (
                  <>
                    <Button variant="outline" className="flex-1 gap-1 bg-transparent" size="sm">
                      <MessageSquare className="h-4 w-4" />
                      Discuss
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                      Leave
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" size="sm">Join Group</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
