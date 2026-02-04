'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'React 19 Deep Dive Workshop',
    date: 'March 15, 2024',
    time: '2:00 PM - 4:00 PM',
    location: 'San Francisco, CA',
    attendees: 120,
    speakers: ['Dan Abramov', 'Sophie Alpert'],
    tag: 'Workshop',
    registered: false,
  },
  {
    id: 2,
    title: 'Tech Hiring Panel: Getting Your First Job',
    date: 'March 18, 2024',
    time: '6:00 PM - 7:30 PM',
    location: 'Virtual',
    attendees: 450,
    speakers: ['Sarah Chen', 'Alex Rodriguez', 'Jordan Tech'],
    tag: 'Panel Discussion',
    registered: true,
  },
  {
    id: 3,
    title: 'Career Growth Strategies for Developers',
    date: 'March 22, 2024',
    time: '10:00 AM - 11:30 AM',
    location: 'San Francisco, CA',
    attendees: 85,
    speakers: ['Emily Watson'],
    tag: 'Webinar',
    registered: false,
  },
];

export default function EventsPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground">Network and learn with professionals in your field</p>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-6 border-border hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{event.tag}</Badge>
                    {event.registered && (
                      <Badge variant="default" className="text-xs gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Registered
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                </div>
                <Button variant={event.registered ? 'outline' : 'default'}>
                  {event.registered ? 'Registered' : 'Register'}
                </Button>
              </div>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {event.date} • {event.time}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {event.attendees} attending
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground mb-2">Speakers</p>
                <div className="flex gap-2">
                  {event.speakers.map((speaker) => (
                    <Badge key={speaker} variant="outline" className="text-xs">
                      {speaker}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
