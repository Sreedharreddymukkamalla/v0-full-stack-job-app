'use client';

import { useState } from 'react';
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

const jobListings = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    logo: 'V',
    logoColor: 'from-slate-800 to-slate-900',
    location: 'San Francisco, CA',
    salary: '$180K - $240K',
    type: 'Full-time',
    level: 'Senior',
    skills: ['React', 'TypeScript', 'Next.js'],
    posted: '2 days ago',
    applicants: 45,
  },
  {
    id: 2,
    title: 'Product Designer',
    company: 'Stripe',
    logo: 'S',
    logoColor: 'from-indigo-500 to-purple-600',
    location: 'Remote',
    salary: '$160K - $220K',
    type: 'Full-time',
    level: 'Mid-level',
    skills: ['Figma', 'UX Research', 'Prototyping'],
    posted: '5 days ago',
    applicants: 89,
  },
  {
    id: 3,
    title: 'Data Engineer',
    company: 'Databricks',
    logo: 'D',
    logoColor: 'from-orange-500 to-red-500',
    location: 'Mountain View, CA',
    salary: '$170K - $250K',
    type: 'Full-time',
    level: 'Senior',
    skills: ['Python', 'Spark', 'Scala'],
    posted: '1 day ago',
    applicants: 32,
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'Notion',
    logo: 'N',
    logoColor: 'from-gray-700 to-gray-900',
    location: 'San Francisco, CA',
    salary: '$140K - $200K',
    type: 'Full-time',
    level: 'Entry-level',
    skills: ['JavaScript', 'React', 'Node.js'],
    posted: '3 days ago',
    applicants: 67,
  },
];

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

  const clearFilters = () => {
    setExperienceLevel('all');
    setLocationFilter('');
    setCompanyFilter('');
    setSearchQuery('');
    setActiveFilter('All Jobs');
  };

  const hasActiveFilters = experienceLevel !== 'all' || locationFilter || companyFilter;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Search & Filter */}
      <Card className="p-3 border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-lg border-border/50 bg-secondary/30 focus:bg-background"
            />
          </div>
          <Button 
            variant="outline" 
            className="h-10 rounded-lg gap-2 bg-transparent"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {[experienceLevel !== 'all', locationFilter, companyFilter].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="h-10 rounded-xl">
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

              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search company..."
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4 mr-1.5" />
                Clear all filters
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
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
      </Card>

      {/* Jobs Grid */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        {/* Jobs List */}
        <div className="space-y-2 lg:h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-2">
          {jobListings.map((job) => {
            const isSaved = savedJobs.has(job.id);
            
            return (
              <Card
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-3 border-border/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${
                  selectedJobId === job.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${job.logoColor} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{job.company}</p>
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
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {job.applicants}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Job Details Panel */}
        <div className="lg:h-[calc(100vh-180px)]">
          {selectedJobId ? (
            <Card className="h-full flex flex-col border-border/50 shadow-sm">
              {(() => {
                const job = jobListings.find(j => j.id === selectedJobId);
                if (!job) return null;
                
                return (
                  <>
                    {/* Sticky Header with Actions */}
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

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
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
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{job.applicants} applicants</span>
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
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          We're looking for a talented professional to join our rapidly growing team. In this role, you'll be at the forefront of building innovative solutions that impact millions of users worldwide. You'll collaborate with talented engineers, designers, and product managers to create exceptional products.
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          This is a unique opportunity to make a significant impact in a fast-paced, dynamic environment. You'll have the autonomy to drive projects from conception to completion while working with cutting-edge technologies and best practices.
                        </p>
                      </div>

                      {/* Responsibilities */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground text-base">Key Responsibilities</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Design, develop, and maintain scalable applications and services</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Collaborate with cross-functional teams to define and implement new features</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Write clean, maintainable code following industry best practices</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Participate in code reviews and mentor junior team members</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Contribute to technical documentation and architectural decisions</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Stay up-to-date with emerging technologies and industry trends</span>
                          </li>
                        </ul>
                      </div>

                      {/* Requirements */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground text-base">Requirements</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>5+ years of professional experience in software development</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Strong proficiency in {job.skills.join(', ')} and related technologies</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Experience with modern development workflows and CI/CD pipelines</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Excellent problem-solving skills and attention to detail</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Strong communication and collaboration skills</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Bachelor's degree in Computer Science or equivalent experience</span>
                          </li>
                        </ul>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground text-base">What We Offer</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Competitive salary and equity compensation</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Comprehensive health, dental, and vision insurance</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Flexible work arrangements and unlimited PTO</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Professional development budget and learning opportunities</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Modern office space with state-of-the-art equipment</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Regular team events and company offsites</span>
                          </li>
                        </ul>
                      </div>

                      {/* Company Info */}
                      <div className="space-y-3 pb-4">
                        <h3 className="font-semibold text-foreground text-base">About {job.company}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {job.company} is a leading technology company committed to building products that empower people and businesses worldwide. We believe in creating an inclusive workplace where diverse perspectives drive innovation and creativity.
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Join us in our mission to transform the industry and make a lasting impact on the world. We're excited to hear from you!
                        </p>
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
