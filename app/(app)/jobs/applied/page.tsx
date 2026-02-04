'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, MapPin, Clock, ExternalLink } from 'lucide-react';

type ApplicationStatus = 'under_review' | 'interview' | 'rejected' | 'accepted';

const applications = [
  {
    id: 1,
    jobTitle: 'Senior Frontend Engineer',
    company: 'Vercel',
    location: 'Remote',
    appliedDate: '2024-01-15',
    status: 'under_review' as ApplicationStatus,
    logo: 'V',
    jobUrl: '#',
  },
  {
    id: 2,
    jobTitle: 'Full Stack Developer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    appliedDate: '2024-01-12',
    status: 'interview' as ApplicationStatus,
    logo: 'S',
    jobUrl: '#',
  },
  {
    id: 3,
    jobTitle: 'React Developer',
    company: 'Meta',
    location: 'Menlo Park, CA',
    appliedDate: '2024-01-10',
    status: 'rejected' as ApplicationStatus,
    logo: 'M',
    jobUrl: '#',
  },
  {
    id: 4,
    jobTitle: 'Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    appliedDate: '2024-01-08',
    status: 'accepted' as ApplicationStatus,
    logo: 'G',
    jobUrl: '#',
  },
];

const statusConfig = {
  under_review: { label: 'Under Review', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  interview: { label: 'Interview', color: 'bg-accent/20 text-accent-foreground' },
  rejected: { label: 'Not Selected', color: 'bg-destructive/10 text-destructive' },
  accepted: { label: 'Accepted', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
};

export default function JobsAppliedPage() {
  const [applicationStatuses, setApplicationStatuses] = useState<Record<number, ApplicationStatus>>(
    applications.reduce((acc, app) => ({ ...acc, [app.id]: app.status }), {})
  );

  const handleStatusChange = (appId: number, newStatus: ApplicationStatus) => {
    setApplicationStatuses(prev => ({ ...prev, [appId]: newStatus }));
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Jobs Applied</h1>
          <p className="text-muted-foreground">Track your job applications and their status</p>
        </div>

        <div className="space-y-4">
          {applications.map((app) => {
            const currentStatus = applicationStatuses[app.id];
            const status = statusConfig[currentStatus];
            
            return (
              <Card key={app.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">{app.logo}</span>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {app.jobTitle}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-3.5 w-3.5" />
                            <span>{app.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{app.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Applied Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <Clock className="h-3 w-3" />
                      <span>Applied on {new Date(app.appliedDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-transparent"
                        asChild
                      >
                        <a href={app.jobUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          View Job
                        </a>
                      </Button>

                      {/* Status Dropdown */}
                      <Select 
                        value={currentStatus} 
                        onValueChange={(value: ApplicationStatus) => handleStatusChange(app.id, value)}
                      >
                        <SelectTrigger className={`w-[180px] h-9 ${status.color} border-0 font-medium`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_review">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                              Under Review
                            </div>
                          </SelectItem>
                          <SelectItem value="interview">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-accent" />
                              Interview
                            </div>
                          </SelectItem>
                          <SelectItem value="accepted">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              Accepted
                            </div>
                          </SelectItem>
                          <SelectItem value="rejected">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-destructive" />
                              Not Selected
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>


                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Building className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start applying to jobs and track your applications here
              </p>
              <Button>Browse Jobs</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
