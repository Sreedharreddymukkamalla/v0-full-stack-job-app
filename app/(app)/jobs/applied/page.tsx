'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building, MapPin, Clock, ExternalLink, Plus, Upload, Download } from 'lucide-react';
import Link from 'next/link';
import { fetchAppliedJobs, insertAppliedJob } from '@/lib/supabase';
import { uploadFile } from '@/lib/api';

type ApplicationStatus = 'under_review' | 'interview' | 'rejected' | 'accepted';

type AppliedJob = {
  id: number;
  company_name?: string | null;
  resume_url?: string | null;
  job_title?: string | null;
  job_location?: string | null;
  applied_date?: string | null;
  job_url?: string | null;
};

const statusConfig = {
  under_review: { label: 'Under Review', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  interview: { label: 'Interview', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' },
  rejected: { label: 'Not Selected', color: 'bg-destructive/10 text-destructive' },
  accepted: { label: 'Accepted', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
};

export default function JobsAppliedPage() {
  const [applications, setApplications] = useState<AppliedJob[]>([]);
  const [applicationStatuses, setApplicationStatuses] = useState<Record<number, ApplicationStatus>>({});
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [newJob, setNewJob] = useState({
    jobTitle: '',
    company: '',
    location: '',
    jobUrl: '',
    resume: null as File | null,
  });

  const handleStatusChange = (appId: number, newStatus: ApplicationStatus) => {
    setApplicationStatuses(prev => ({ ...prev, [appId]: newStatus }));
  };

  const handleAddJob = async () => {
    try {
      let resumeUrl: string | null = null;
      if (newJob.resume) {
        resumeUrl = await uploadFile(newJob.resume);
      }

      const payload = {
        company_name: newJob.company || null,
        job_title: newJob.jobTitle || null,
        job_location: newJob.location || null,
        job_url: newJob.jobUrl || null,
        resume_url: resumeUrl,
        applied_date: new Date().toISOString().slice(0, 10),
      };

      await insertAppliedJob(payload);
      // Refresh list
      const rows = await fetchAppliedJobs();
      setApplications(rows as AppliedJob[]);

      setIsAddJobOpen(false);
      setNewJob({ jobTitle: '', company: '', location: '', jobUrl: '', resume: null });
    } catch (err) {
      console.error('[v0] Error adding job:', err);
      setIsAddJobOpen(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await fetchAppliedJobs();
        if (!mounted) return;
        setApplications(rows as AppliedJob[]);
        // initialize statuses
        const statusMap: Record<number, ApplicationStatus> = {};
        (rows || []).forEach((r: any) => {
          statusMap[r.id] = 'under_review';
        });
        setApplicationStatuses(statusMap);
      } catch (err) {
        console.error('[v0] Error loading applied jobs:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filter and sort applications based on search and sortOrder
  const displayedApplications = (applications || [])
    .filter((app) => {
      if (!searchQuery) return true;
      return (app.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    })
    .slice()
    .sort((a, b) => {
      const da = a.applied_date || '';
      const db = b.applied_date || '';
      if (sortOrder === 'newest') return db.localeCompare(da);
      return da.localeCompare(db);
    });

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Jobs Applied</h1>
            <p className="text-muted-foreground">Track your job applications and their status</p>
          </div>
          <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Job Application</DialogTitle>
                <DialogDescription>
                  Manually add a job application you've submitted
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title *</Label>
                  <Input
                    id="job-title"
                    value={newJob.jobTitle}
                    onChange={(e) => setNewJob({...newJob, jobTitle: e.target.value})}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    placeholder="e.g. Vercel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-url">Job URL</Label>
                  <Input
                    id="job-url"
                    value={newJob.jobUrl}
                    onChange={(e) => setNewJob({...newJob, jobUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume (PDF or DOCX)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewJob({...newJob, resume: file});
                        }
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent gap-2"
                      onClick={() => document.getElementById('resume')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {newJob.resume ? newJob.resume.name : 'Upload Resume'}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddJobOpen(false)}
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddJob}
                    disabled={!newJob.jobTitle || !newJob.company}
                  >
                    Add Application
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Search & Sort */}
        <div className="mb-4 flex items-center gap-3">
          <Input
            placeholder="Search by company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-[220px] flex-1"
          />

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort By</span>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'newest' | 'oldest')}>
              <SelectTrigger className="w-[160px] h-9 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {displayedApplications.map((app) => {
            const currentStatus = applicationStatuses[app.id] || 'under_review';
            const status = statusConfig[currentStatus];

            const companyLabel = (app.company_name || '').trim() || '?';
            const displayTitle = app.job_title || '—';
            const displayLocation = app.job_location || '—';
            const appliedDate = app.applied_date ? new Date(app.applied_date).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            }) : 'Unknown';

            return (
              <Card key={app.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">{companyLabel.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {displayTitle}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-3.5 w-3.5" />
                            <span>{app.company_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{displayLocation}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Applied Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <Clock className="h-3 w-3" />
                      <span>Applied on {appliedDate}</span>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-transparent"
                        asChild
                      >
                        <a href={app.job_url || '#'} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          View Job
                        </a>
                      </Button>

                      {app.resume_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent"
                          asChild
                        >
                          <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            View Resume
                          </a>
                        </Button>
                      )}

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
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
