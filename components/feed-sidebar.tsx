"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  Clock,
  Users2,
  Pin,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getHomePageData } from "@/app/(app)/feed/getHomePageData";

export function FeedSidebar() {
  const currentUser = getCurrentUser();

  // Carousel state for jobs
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const jobsPerPage = 3;
  const [jobs, setJobs] = useState<any[]>([]);
  const totalJobs = jobs.length;
  const latestJobs = jobs.slice(currentJobIndex, currentJobIndex + jobsPerPage);

  // Get suggested people (exclude current user)
  const [suggestedPeople, setSuggestedPeople] = useState([]);
  const [removingPerson, setRemovingPerson] = useState<string | null>(null);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJobIndex((prev) =>
        prev + jobsPerPage >= totalJobs ? 0 : prev + jobsPerPage,
      );
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [totalJobs]);

  // Get current jobs to display
  const currentJobs = jobs.slice(
    currentJobIndex,
    currentJobIndex + jobsPerPage,
  );

  // Fetch latest jobs and suggestions from RPC
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getHomePageData();
        if (!mounted) return;

        if (
          data?.latest_jobs &&
          Array.isArray(data.latest_jobs) &&
          data.latest_jobs.length > 0
        ) {
          // Map RPC job shape to what the UI expects
          const mapped = data.latest_jobs.map((j: any) => ({
            id: j.id?.toString() || String(Math.random()),
            title: j.title || j.job_title || "Job",
            company: j.company_name || j.company || "Company",
            location: j.location || "Remote",
            posted_at: j.posted_at || new Date().toISOString(),
            url: j.url,
          }));
          setJobs(mapped);
        }

        if (
          data?.suggestions &&
          Array.isArray(data.suggestions) &&
          data.suggestions.length > 0
        ) {
          const people = data.suggestions
            .map((s: any) => ({
              id: s.id != null ? s.id.toString() : String(Math.random()),
              name: s.name || s.full_name || "",
              avatar: s.avatar || s.profile_image_url || "/placeholder.svg",
              title: s.headline || s.title || "",
            }))
            .filter((p: any) => p.id !== currentUser?.id)
            .slice(0, 3);

          if (people.length > 0) setSuggestedPeople(people as any);
        }
      } catch (err) {
        console.warn(
          "[v0] FeedSidebar: could not load latest jobs/suggestions",
          err,
        );
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [currentUser?.id]);

  // Carousel navigation
  const goToPrevious = () => {
    setCurrentJobIndex((prev) =>
      prev - jobsPerPage < 0
        ? Math.max(0, totalJobs - jobsPerPage)
        : prev - jobsPerPage,
    );
  };

  const goToNext = () => {
    setCurrentJobIndex((prev) =>
      prev + jobsPerPage >= totalJobs ? 0 : prev + jobsPerPage,
    );
  };

  // Handle connect click
  const handleConnect = (personId: string) => {
    setRemovingPerson(personId);

    // Remove person after animation completes
    setTimeout(() => {
      setSuggestedPeople((prev) => prev.filter((p) => p.id !== personId));
      setRemovingPerson(null);
    }, 300); // Match animation duration
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6 sticky top-20">
      {/* Latest Jobs Card */}
      <Card className="p-5 shadow-sm border-border/50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-foreground" />
            <h2 className="font-bold text-lg text-foreground">Latest Jobs</h2>
          </div>
        </div>

        <div className="space-y-4 transition-all duration-500">
          {currentJobs.map((job) => {
            // Extract company initial for logo
            const companyInitial = job.company.charAt(0).toUpperCase();

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block group"
              >
                <div className="flex gap-3 border-l-4 border-accent pl-3 py-1 hover:border-primary transition-colors">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      {companyInitial}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1.5">
                      {job.company}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(job.posted_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Link
            href="/jobs"
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            View all jobs
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* People You May Know Card */}
      <Card className="p-5 shadow-sm border-border/50">
        <div className="flex items-center gap-2 mb-5">
          <Users2 className="h-5 w-5 text-foreground" />
          <h2 className="font-bold text-lg text-foreground">
            People You May Know
          </h2>
        </div>

        <div className="space-y-4">
          {suggestedPeople.map((person) => (
            <div
              key={person.id}
              className={`flex items-center gap-3 transition-all duration-300 ${removingPerson === person.id
                  ? "opacity-0 translate-x-full"
                  : "opacity-100 translate-x-0"
                }`}
            >
              <Link href={`/users/${person.id}`}>
                <Avatar className="h-11 w-11 ring-2 ring-border hover:ring-primary/50 transition-all cursor-pointer">
                  <AvatarImage src={person.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {person.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/users/${person.id}`}
                  className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block"
                >
                  {person.name}
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {person.title}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs font-semibold rounded-lg bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleConnect(person.id)}
              >
                Connect
              </Button>
            </div>
          ))}
        </div>

        <Link href="/users">
          <Button
            variant="ghost"
            className="w-full mt-4 text-sm font-semibold hover:bg-secondary"
          >
            See all recommendations
          </Button>
        </Link>
      </Card>
    </div>
  );
}
