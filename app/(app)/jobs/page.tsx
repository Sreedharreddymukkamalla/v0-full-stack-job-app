'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  MapPin, 
  DollarSign, 
  Bookmark, 
  Search, 
  SlidersHorizontal,
  Building2,
  Clock,
  TrendingUp,
  Zap,
  ExternalLink,
  X,
} from 'lucide-react';

import { apiFetch } from '@/lib/api';
import DOMPurify from 'dompurify';

type Job = {
  id: number;
  title: string;
  company: string;
  logo?: string;
  logoColor?: string;
  location?: string;
  salary?: string;
  type?: string;
  level?: string;
  skills?: string[];
  posted?: string;
  // optional backend fields
  remote?: boolean;
  posted_at?: string | null;
  url?: string | null;
  description?: string | null;
};

const filterTabs = ['All Jobs', 'Full-time', 'Remote', 'Contract', 'Part-time'];

export default function JobsPage() {
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevant');
  const jobsPerPage = 10;
  const apiPageSize = 150;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  function timeAgo(iso?: string | null) {
    if (!iso) return "Recently";
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return "Today";
      if (days === 1) return "1 day ago";
      if (days < 7) return `${days} days ago`;
      return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso));
    } catch {
      return "Recently";
    }
  }

  const gradientPool = [
    "from-slate-800 to-slate-900",
    "from-indigo-500 to-purple-600",
    "from-orange-500 to-red-500",
    "from-gray-700 to-gray-900",
    "from-emerald-500 to-teal-600",
    "from-blue-500 to-cyan-600",
  ];

  function pickGradient(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
    return gradientPool[Math.abs(h) % gradientPool.length];
  }

  function extractSalary(html?: string | null) {
    if (!html) return undefined;
    const match = html.match(/\$\s*[\d,]+(?:\s*[-–]\s*\$\s*[\d,]+)?/);
    return match ? match[0].replace(/\s+/g, " ") : undefined;
  }

  function extractLevel(r: any) {
    const source = (r.level || r.seniority || r.experience || r.title || r.description || '').toString().toLowerCase();
    if (/\b(entry|junior|jr)\b/.test(source)) return 'entry';
    if (/\b(mid|intermediate|associate)\b/.test(source)) return 'mid';
    if (/\b(principal|principal|lead|head|director)\b/.test(source)) return 'lead';
    if (/\b(senior|sr)\b/.test(source)) return 'senior';
    // fallback: if the raw value already matches our keys
    if (['entry', 'mid', 'senior', 'lead'].includes(source)) return source;
    return '';
  }

  function mapRemoteJob(r: any): Job {
    const title = r.title || r.job_title || r.external_title || "";
    const company = r.company_name || r.company || r.companyName || "Unknown";
    const location = r.location || r.city || r.office || (r.remote ? "Remote" : "");
    const posted = timeAgo(r.posted_at || r.created_at || null);
    const salary = extractSalary(r.description) || (r.salary_range || r.salary || undefined);
    const logo = (company || "?").charAt(0).toUpperCase();
    const logoColor = pickGradient(company || String(r.id || Math.random()));
    const detectedLevel = extractLevel(r) || (r.level ? String(r.level).toLowerCase() : '');
    return {
      id: Number(r.id),
      title,
      company,
      logo,
      logoColor,
      location,
      salary,
      type: r.employment_type || r.type || "Full-time",
      level: detectedLevel || "",
      skills: r.skills || [],
      posted,
      remote: !!r.remote,
      posted_at: r.posted_at || null,
      url: r.url || r.apply_url || null,
      description: r.description || null,
    };
  }

  function displayLevel(level?: string) {
    if (!level) return '';
    const labels: Record<string, string> = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior',
      lead: 'Lead/Principal',
    };
    return labels[level] ?? level;
  }

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const buildAndFetch = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (locationFilter) params.append('location', locationFilter);
      // include page size and page requested by the client
      params.append('page_size', String(apiPageSize));
      params.append('page', String(page));
      params.append('sync', 'true');

      const chunk = await apiFetch<any[]>(
        `/jobs${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (Array.isArray(chunk)) setJobs(chunk.map(mapRemoteJob));
    } catch (err) {
      // keep using local mock data on error
    } finally {
      setLoading(false);
    }
  };

  const mountedRef = useRef(false);

  // call once on mount, then debounce on subsequent changes
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      void buildAndFetch(1);
      setCurrentPage(1);
      return;
    }

    const id = setTimeout(() => {
      void buildAndFetch(1);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, locationFilter, sortBy, dateFilter]);

  const clearFilters = () => {
    setExperienceLevel('all');
    setLocationFilter('');
    setCompanyFilter('');
    setSearchQuery('');
    setActiveFilter('All Jobs');
    setDateFilter('all');
  };

  const hasActiveFilters = experienceLevel !== 'all' || locationFilter || companyFilter;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Search & Filter */}
      <Card className="p-3 border-border/50 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-lg border-border/50 bg-secondary/30 focus:bg-background"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-9 h-10 rounded-lg border-border/50 bg-secondary/30 focus:bg-background"
              />
            </div>
            <div className="relative flex-1">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Company"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="pl-9 h-10 rounded-lg border-border/50 bg-secondary/30 focus:bg-background"
              />
            </div>
            <Button 
              variant="outline" 
              className="h-10 rounded-lg gap-2 bg-transparent whitespace-nowrap"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>More Filters</span>
              {hasActiveFilters && experienceLevel !== 'all' && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  1
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="h-10 rounded-xl w-[200px]">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 items-center justify-between">
            <div className="flex gap-2">
              {filterTabs.map((tab) => (
                <Button
                  key={tab}
                  variant={activeFilter === tab ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(tab)}
                  className={`rounded-full px-4 h-8 whitespace-nowrap ${
                    activeFilter !== tab ? 'bg-transparent hover:bg-secondary' : ''
                  }`}
                >
                  {tab}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 w-[140px] rounded-full text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary_high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary_low">Salary: Low to High</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-8 w-[140px] rounded-full text-sm">
                  <SelectValue placeholder="Date posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        {/* Jobs List */}
        <div className="space-y-2">
          {jobs
            .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
            .map((job) => {
              const isSaved = savedJobs.has(job.id);
              
              return (
                <Card
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-2 border border-border shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer group ${
                    selectedJobId === job.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${job.logoColor} flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}>
                      {job.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">{job.company}</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3 w-3 flex-shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mb-2">
                    <Badge variant="secondary" className="rounded text-[10px] font-medium px-1.5 py-0.5">{job.type}</Badge>
                    <Badge variant="secondary" className="rounded text-[10px] font-medium px-1.5 py-0.5">{job.level}</Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {job.posted}
                    </span>
                  </div>
              </Card>
            );
          })}
          
          {/* Pagination */}
          {jobs.length > jobsPerPage && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-transparent"
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {(() => {
                  const totalPages = Math.ceil(jobs.length / jobsPerPage);
                  const maxPages = 5;
                  let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
                  let end = Math.min(totalPages, start + maxPages - 1);
                  if (end - start < maxPages - 1) start = Math.max(1, end - maxPages + 1);
                  const pages: number[] = [];
                  for (let i = start; i <= end; i++) pages.push(i);
                  return pages.map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage !== page ? 'bg-transparent' : ''}
                    >
                      {page}
                    </Button>
                  ));
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(jobs.length / jobsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(jobs.length / jobsPerPage)}
                className="bg-transparent"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Job Details Panel */}
        <div>
          {selectedJobId ? (
            <Card className="border-border/50 shadow-sm">
              {(() => {
                const job = jobs.find(j => j.id === selectedJobId);
                if (!job) return null;
                
                return (
                  <>
                    {/* Header with Actions */}
                    <div className="p-5 border-b border-border/50 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${job.logoColor} flex items-center justify-center text-white font-bold text-xl shadow-sm flex-shrink-0`}>
                          {job.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-bold text-xl text-foreground mb-1">{job.title}</h2>
                          <p className="text-muted-foreground font-medium">{job.company}</p>
                        </div>
                      </div>

                      {/* Action Buttons at Top */}
                      <div className="flex gap-2">
                        <Button className="flex-1 h-11 rounded-xl shadow-sm">
                          <Zap className="h-4 w-4 mr-2" />
                          Apply Now
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-11 w-11 rounded-xl bg-transparent flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id);
                          }}
                        >
                          <Bookmark className={`h-5 w-5 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-6">
                      {/* Key Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">Posted {job.posted}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="rounded-lg font-medium">{job.type}</Badge>
                          <Badge variant="secondary" className="rounded-lg font-medium">{job.level}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="rounded-lg text-xs font-normal bg-transparent">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Job Description */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground text-base">About the Role</h3>
                        {job.description ? (
                          <div
                            className="prose max-w-none text-sm text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: normalizeDescription(job.description) }}
                          />
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Job description is not available for this position.
                            </p>
                          </>
                        )}
                      </div>

                    </div>
                  </>
                );
              })()}
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center border-border/50 border-dashed">
              <div className="text-center space-y-3 p-8">
                <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto">
                  <ExternalLink className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Select a job to view details
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeDescription(html?: string | null) {
  if (!html) return "";
  // first sanitize to remove unsafe content
  const sanitized = DOMPurify.sanitize(html);
  const doc = new DOMParser().parseFromString(sanitized, 'text/html');
  const headings = doc.querySelectorAll('h1,h2,h3,h4,h5,h6');
  headings.forEach((h) => {
    const wrapper = doc.createElement('h3');
    wrapper.innerHTML = h.innerHTML;
    // consistent heading style used across the app
    wrapper.className = 'font-semibold text-foreground text-base';
    h.replaceWith(wrapper);
  });
  // re-sanitize after transformations
  return DOMPurify.sanitize(doc.body.innerHTML);
}
