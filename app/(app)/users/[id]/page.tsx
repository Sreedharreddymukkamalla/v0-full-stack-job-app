'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  full_name?: string;
  name?: string;
  headline?: string;
  title?: string;
  avatar?: string;
  profile_image_url?: string;
  avatar_url?: string;
  location?: string;
  summary?: string;
  about?: string;
  skills?: string[];
  cover_image_url?: string;
  banner?: string;
  experience?: {
    experience?: any[];
    education?: any[];
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the user profile from the API
        const response = await apiFetch<any>(`/profiles/${userId}`, {
          method: 'GET',
        });

        if (!response) {
          setError('User profile not found');
          setLoading(false);
          return;
        }

        setProfile(response);
      } catch (err) {
        console.error('[v0] Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/20">
        <div className="max-w-5xl mx-auto p-6">
          <Card className="overflow-hidden mb-6 animate-pulse">
            <div className="h-56 bg-muted" />
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between -mt-20 relative z-10 mb-6">
                <div className="h-36 w-36 bg-muted rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-muted rounded w-1/3" />
                <div className="h-5 bg-muted rounded w-1/4" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-secondary/20">
        <div className="max-w-5xl mx-auto p-6">
          <Link href="/feed">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">{error || 'User not found'}</p>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.name || 'User';
  const displayTitle = profile.headline || profile.title || '';
  const displayLocation = profile.location || '';
  const displayBio = profile.summary || profile.about || '';
  const displayAvatar = profile.profile_image_url || profile.avatar_url || profile.avatar || '/placeholder.svg';
  const displayBanner = profile.cover_image_url || profile.banner || '';
  const displaySkills = profile.skills || [];

  const mappedExperiences = (profile.experience?.experience || []).map((e: any, idx: number) => ({
    id: e.id || `exp-${idx}`,
    title: e.title || e.job_title || '',
    company: e.company || '',
    period: `${e.startDate || e.start || ''} - ${e.endDate || e.end || 'Present'}`,
    description: e.description || '',
  }));

  const mappedEducation = (profile.experience?.education || []).map((ed: any, idx: number) => ({
    id: ed.id || `edu-${idx}`,
    degree: ed.degree || ed.field || '',
    school: ed.school || '',
    year: ed.endDate || ed.year || '',
  }));

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-5xl mx-auto p-6">
        {/* Back Button */}
        <Link href="/feed">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="overflow-hidden mb-6 relative">
          {/* Banner */}
          <div className="h-56 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient relative">
            {displayBanner && (
              <img
                src={displayBanner}
                alt="User banner"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between -mt-20 relative z-10 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div>
                  <Avatar className="h-36 w-36 border-4 border-card ring-4 ring-background shadow-xl">
                    <AvatarImage src={displayAvatar} />
                    <AvatarFallback className="text-2xl font-bold">
                      {displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-2">
                  <h1 className="text-3xl font-bold text-foreground mt-2">
                    {displayName}
                  </h1>
                  <p className="text-lg text-foreground/80 font-medium">
                    {displayTitle}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {displayLocation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Connect
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
              </div>
            </div>

            {/* About */}
            {displayBio && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">About</h3>
                <p className="text-foreground text-base leading-relaxed">
                  {displayBio}
                </p>
              </div>
            )}

            {/* Skills */}
            {displaySkills.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {displaySkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {mappedExperiences.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-4">Experience</h3>
                <div className="space-y-4">
                  {mappedExperiences.map((exp, index) => (
                    <div
                      key={exp.id}
                      className={`border-l-2 ${
                        index === 0 ? 'border-accent' : 'border-primary'
                      } pl-4`}
                    >
                      <h4 className="font-semibold text-foreground">
                        {exp.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {exp.company} • {exp.period}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-foreground mt-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {mappedEducation.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Education</h3>
                <div className="space-y-3">
                  {mappedEducation.map((edu) => (
                    <div key={edu.id} className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-foreground">
                          {edu.school
                            .split(' ')
                            .map((w: string) => w[0])
                            .join('')
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {edu.degree}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {edu.school} • {edu.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
