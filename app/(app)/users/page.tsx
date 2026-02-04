'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, UserPlus, MessageSquare, UserCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const suggestedUsers = [
  {
    id: 1,
    name: 'Susmitha Kokkalgave',
    title: 'Data Engineering',
    company: 'Google',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Susmitha',
    banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    skills: ['Python', 'SQL', 'Spark'],
    type: 'suggested',
  },
  {
    id: 2,
    name: 'Alex Rodriguez',
    title: 'UX Designer',
    company: 'Stripe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    banner: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=200&fit=crop',
    skills: ['Figma', 'Research', 'Design Systems'],
    type: 'suggested',
  },
  {
    id: 3,
    name: 'Jordan Tech',
    title: 'Senior Developer',
    company: 'Google',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    banner: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=200&fit=crop',
    skills: ['Golang', 'Microservices', 'Cloud'],
    type: 'suggested',
  },
  {
    id: 4,
    name: 'Maria Garcia',
    title: 'Frontend Engineer',
    company: 'Meta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    banner: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop',
    skills: ['React', 'TypeScript', 'Next.js'],
    type: 'suggested',
  },
];

const invitations = [
  {
    id: 101,
    name: 'Emma Wilson',
    title: 'Product Manager',
    company: 'Notion',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    banner: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=200&fit=crop',
    skills: ['Product', 'Strategy', 'Leadership'],
    type: 'invitation',
  },
  {
    id: 102,
    name: 'James Miller',
    title: 'Backend Engineer',
    company: 'Amazon',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    banner: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=200&fit=crop',
    skills: ['Java', 'AWS', 'Microservices'],
    type: 'invitation',
  },
];

const connections = [
  {
    id: 201,
    name: 'Sarah Chen',
    title: 'Product Manager',
    company: 'Vercel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=200&fit=crop',
    skills: ['Product Strategy', 'Leadership', 'Agile'],
    type: 'connected',
  },
  {
    id: 202,
    name: 'David Kim',
    title: 'DevOps Engineer',
    company: 'Amazon',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    banner: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=200&fit=crop',
    skills: ['Kubernetes', 'CI/CD', 'AWS'],
    type: 'connected',
  },
];

const sentRequests = [
  {
    id: 301,
    name: 'Lisa Anderson',
    title: 'Engineering Manager',
    company: 'Meta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    banner: 'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=400&h=200&fit=crop',
    skills: ['Leadership', 'Team Building', 'Architecture'],
    type: 'pending',
  },
];

export default function UsersPage() {
  const [suggested, setSuggested] = useState(suggestedUsers);
  const [invites, setInvites] = useState(invitations);
  const [myConnections, setMyConnections] = useState(connections);
  const [pending, setPending] = useState(sentRequests);
  const [invitationsOpen, setInvitationsOpen] = useState(true);

  const handleRemove = (userId: number, type: string) => {
    if (type === 'suggested') {
      setSuggested(suggested.filter(user => user.id !== userId));
    } else if (type === 'invitation') {
      setInvites(invites.filter(user => user.id !== userId));
    }
  };

  const handleAcceptInvite = (userId: number) => {
    const user = invites.find(u => u.id === userId);
    if (user) {
      setMyConnections([...myConnections, { ...user, type: 'connected' }]);
      setInvites(invites.filter(u => u.id !== userId));
    }
  };

  const handleConnect = (userId: number) => {
    const user = suggested.find(u => u.id === userId);
    if (user) {
      setPending([...pending, { ...user, type: 'pending' }]);
      setSuggested(suggested.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Network</h1>
          <p className="text-muted-foreground">Connect and network with professionals in your field</p>
        </div>

        <Tabs defaultValue="suggested" className="space-y-6">
          <TabsList>
            <TabsTrigger value="suggested">
              Suggested People
              {(suggested.length + invites.length) > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs">{suggested.length + invites.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections">
              My Connections
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{myConnections.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent Requests
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{pending.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggested" className="space-y-6">
            {/* Invitations Section */}
            {invites.length > 0 && (
              <Collapsible open={invitationsOpen} onOpenChange={setInvitationsOpen}>
                <Card className="p-4 border-border/50">
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Invitations ({invites.length})
                    </h2>
                    {invitationsOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {invites.map((user) => (
                    <Card key={user.id} className="overflow-hidden relative group hover:shadow-lg transition-shadow">
                      <button
                        onClick={() => handleRemove(user.id, 'invitation')}
                        className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                      >
                        <X className="h-4 w-4 text-foreground" />
                      </button>

                      <div className="h-24 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                        <img
                          src={user.banner || "/placeholder.svg"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="relative pb-6">
                        <div className="flex justify-center -mt-12 mb-3">
                          <Avatar className="h-24 w-24 ring-4 ring-card">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="text-center px-4 mb-4">
                          <h3 className="font-semibold text-lg text-foreground mb-1">{user.name}</h3>
                          <p className="text-sm text-primary font-medium">{user.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{user.company}</p>
                        </div>

                        <div className="px-4 mb-4">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {user.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="px-4 flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleAcceptInvite(user.id)}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-transparent"
                            onClick={() => handleRemove(user.id, 'invitation')}
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    </Card>
                    ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Suggested People */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                People You May Know
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {suggested.map((user) => (
                  <Card key={user.id} className="overflow-hidden relative group hover:shadow-lg transition-shadow">
                    <button
                      onClick={() => handleRemove(user.id, 'suggested')}
                      className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                    >
                      <X className="h-4 w-4 text-foreground" />
                    </button>

                    <div className="h-24 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                      <img
                        src={user.banner || "/placeholder.svg"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="relative pb-6">
                      <div className="flex justify-center -mt-12 mb-3">
                        <Avatar className="h-24 w-24 ring-4 ring-card">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="text-center px-4 mb-4">
                        <h3 className="font-semibold text-lg text-foreground mb-1">{user.name}</h3>
                        <p className="text-sm text-primary font-medium">{user.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{user.company}</p>
                      </div>

                      <div className="px-4 mb-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {user.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="px-4 flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleConnect(user.id)}
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                          Connect
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connections">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myConnections.map((user) => (
                <Card key={user.id} className="overflow-hidden relative group hover:shadow-lg transition-shadow">
                  <div className="h-24 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={user.banner || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="relative pb-6">
                    <div className="flex justify-center -mt-12 mb-3">
                      <Avatar className="h-24 w-24 ring-4 ring-card">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="text-center px-4 mb-4">
                      <h3 className="font-semibold text-lg text-foreground mb-1">{user.name}</h3>
                      <p className="text-sm text-primary font-medium">{user.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{user.company}</p>
                    </div>

                    <div className="px-4 mb-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {user.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="px-4">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sent">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pending.map((user) => (
                <Card key={user.id} className="overflow-hidden relative group hover:shadow-lg transition-shadow">
                  <div className="h-24 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={user.banner || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="relative pb-6">
                    <div className="flex justify-center -mt-12 mb-3">
                      <Avatar className="h-24 w-24 ring-4 ring-card">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="text-center px-4 mb-4">
                      <h3 className="font-semibold text-lg text-foreground mb-1">{user.name}</h3>
                      <p className="text-sm text-primary font-medium">{user.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{user.company}</p>
                    </div>

                    <div className="px-4 mb-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {user.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="px-4 flex gap-2 items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Request Pending</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
