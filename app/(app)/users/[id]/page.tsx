'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, UserPlus, ArrowLeft, Edit3, Check, X, Camera, Plus } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

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
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser?.id === userId;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Individual edit states
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);

  // Individual form data
  const [aboutForm, setAboutForm] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch<any>(`/profiles/${userId}`, {
          method: 'GET',
        });

        if (!response) {
          setError('User profile not found');
          setLoading(false);
          return;
        }

        setProfile(response);

        // Initialize form data
        setAboutForm(response.summary || response.about || '');
        const mappedExp = (response.experience?.experience || []).map((e: any, idx: number) => ({
          id: e.id || `exp-${idx}`,
          title: e.title || e.job_title || '',
          company: e.company || '',
          period: `${e.startDate || e.start || ''} - ${e.endDate || e.end || 'Present'}`,
          description: e.description || '',
        }));
        setExperiences(mappedExp);

        const mappedEdu = (response.experience?.education || []).map((ed: any, idx: number) => ({
          id: ed.id || `edu-${idx}`,
          degree: ed.degree || ed.field || '',
          school: ed.school || '',
          year: ed.endDate || ed.year || '',
        }));
        setEducation(mappedEdu);
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

  const handleSaveAbout = async () => {
    // TODO: Implement API call to save about
    console.log('[v0] Saving about:', aboutForm);
    if (profile) {
      setProfile({ ...profile, about: aboutForm });
    }
    setEditingAbout(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && profile) {
      const updatedSkills = [...(profile.skills || []), newSkill.trim()];
      setProfile({ ...profile, skills: updatedSkills });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: (profile.skills || []).filter(s => s !== skillToRemove)
      });
    }
  };

  const handleAddExperience = () => {
    const newExp = {
      id: Date.now(),
      title: '',
      company: '',
      period: '',
      description: ''
    };
    setExperiences([newExp, ...experiences]);
  };

  const handleUpdateExperience = (id: any, field: string, value: string) => {
    setExperiences(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleRemoveExperience = (id: any) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleSaveExperience = async () => {
    // TODO: Implement API call to save experience
    console.log('[v0] Saving experience:', experiences);
    setEditingExperience(false);
  };

  const handleAddEducation = () => {
    const newId = Math.max(...education.map((e: any) => e.id as number || 0), 0) + 1;
    setEducation([...education, { id: newId, degree: '', school: '', year: '' }]);
  };

  const handleUpdateEducation = (id: any, field: string, value: string) => {
    setEducation(education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const handleRemoveEducation = (id: any) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const handleSaveEducation = async () => {
    // TODO: Implement API call to save education
    console.log('[v0] Saving education:', education);
    setEditingEducation(false);
  };

  const handleSaveSkills = async () => {
    // TODO: Implement API call to save skills
    console.log('[v0] Saving skills:', profile?.skills);
    setEditingSkills(false);
  };

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
                <div className="relative">
                  <Avatar className="h-36 w-36 border-4 border-card ring-4 ring-background shadow-xl">
                    <AvatarImage src={displayAvatar} />
                    <AvatarFallback className="text-2xl font-bold">
                      {displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="avatar-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log('[v0] Profile photo selected:', file.name);
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </>
                  )}
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
              {!isOwnProfile && (
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
              )}
            </div>

            {/* About */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">About</h3>
                {isOwnProfile && !editingAbout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingAbout(true)}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              {editingAbout ? (
                <div className="space-y-3">
                  <Textarea
                    value={aboutForm}
                    onChange={(e) => setAboutForm(e.target.value)}
                    placeholder="Tell us about yourself"
                    className="resize-none min-h-[100px]"
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveAbout}>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingAbout(false);
                        setAboutForm(displayBio);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground text-base leading-relaxed">
                  {displayBio || (isOwnProfile ? 'No about section yet. Click Edit to add one.' : 'No about section available.')}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Skills & Expertise</h3>
                {isOwnProfile && !editingSkills && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSkills(true)}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              {editingSkills ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {displaySkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        {skill} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSkill}
                      className="bg-transparent"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={handleSaveSkills}>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSkills(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {displaySkills.length > 0 ? (
                    displaySkills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {isOwnProfile ? 'No skills yet. Click Edit to add some.' : 'No skills listed.'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Experience</h3>
                {isOwnProfile && !editingExperience && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingExperience(true)}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              {editingExperience ? (
                <div className="space-y-4 mb-4">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="border border-border rounded-lg p-4 space-y-3 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="absolute top-2 right-2 h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Input
                        value={exp.title}
                        onChange={(e) => handleUpdateExperience(exp.id, 'title', e.target.value)}
                        placeholder="Job title"
                        className="font-semibold"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company"
                          className="flex-1"
                        />
                        <Input
                          value={exp.period}
                          onChange={(e) => handleUpdateExperience(exp.id, 'period', e.target.value)}
                          placeholder="2021 - Present"
                          className="flex-1"
                        />
                      </div>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your role and achievements..."
                        className="resize-none min-h-[60px]"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAddExperience}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Experience
                  </Button>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={handleSaveExperience}>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingExperience(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {experiences.length > 0 ? (
                    experiences.map((exp, index) => (
                      <div
                        key={exp.id}
                        className={`border-l-2 ${
                          index === 0 ? 'border-accent' : 'border-primary'
                        } pl-4`}
                      >
                        <h4 className="font-semibold text-foreground">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exp.company} • {exp.period}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-foreground mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {isOwnProfile ? 'No experience yet. Click Edit to add some.' : 'No experience listed.'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Education</h3>
                {isOwnProfile && !editingEducation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEducation(true)}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              {editingEducation ? (
                <div className="space-y-4 mb-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="border border-border rounded-lg p-4 space-y-3 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="absolute top-2 right-2 h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Input
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="Degree and Field of Study"
                      />
                      <Input
                        value={edu.school}
                        onChange={(e) => handleUpdateEducation(edu.id, 'school', e.target.value)}
                        placeholder="School or University"
                      />
                      <Input
                        value={edu.year}
                        onChange={(e) => handleUpdateEducation(edu.id, 'year', e.target.value)}
                        placeholder="Graduation Year"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAddEducation}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Education
                  </Button>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={handleSaveEducation}>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingEducation(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {education.length > 0 ? (
                    education.map((edu) => (
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
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {isOwnProfile ? 'No education yet. Click Edit to add some.' : 'No education listed.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
