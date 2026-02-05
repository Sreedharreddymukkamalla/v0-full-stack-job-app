'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Check, X, Camera, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
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
  const userId = params.id as string;
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser?.id === userId;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    title: '',
    location: '',
    bio: '',
    skills: [] as string[],
    newSkill: '',
    experiences: [] as any[],
    education: [] as any[],
  });

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

        // Map profile data to form state
        const mappedExperiences = (response.experience?.experience || []).map((e: any, idx: number) => ({
          id: e.id || `exp-${idx}`,
          title: e.title || e.job_title || '',
          company: e.company || '',
          period: `${e.startDate || e.start || ''} - ${e.endDate || e.end || 'Present'}`,
          description: e.description || '',
        }));

        const mappedEducation = (response.experience?.education || []).map((ed: any, idx: number) => ({
          id: ed.id || `edu-${idx}`,
          degree: ed.degree || ed.field || '',
          school: ed.school || '',
          year: ed.endDate || ed.year || '',
        }));

        setFormData({
          name: response.full_name || response.name || '',
          title: response.headline || response.title || '',
          location: response.location || '',
          bio: response.summary || response.about || '',
          skills: response.skills || [],
          newSkill: '',
          experiences: mappedExperiences,
          education: mappedEducation,
        });
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

  const handleSave = () => {
    console.log('[v0] Saving profile:', formData);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  const addSkill = () => {
    if (formData.newSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill.trim()],
        newSkill: ''
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: '',
      company: '',
      period: '',
      description: ''
    };
    setFormData({
      ...formData,
      experiences: [newExp, ...formData.experiences]
    });
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id: number) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.filter(exp => exp.id !== id)
    });
  };

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
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">{error || 'User not found'}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-5xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-6 relative">
          {/* Banner */}
          <div className="h-56 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient relative">
            {isEditMode && (
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="cover-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('[v0] Cover photo selected:', file.name);
                  }
                }}
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between -mt-20 relative z-10 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="relative">
                  <Avatar className="h-36 w-36 border-4 border-card ring-4 ring-background shadow-xl">
                    <AvatarImage src={profile?.profile_image_url || profile?.profile_image || profile?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{(formData.name || 'U').charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isOwnProfile && isEditMode && (
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
                  {isOwnProfile && isEditMode ? (
                    <div className="space-y-2">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Your name"
                        className="text-3xl font-bold h-auto py-1 px-2"
                      />
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Your title"
                        className="text-lg h-auto py-1 px-2"
                      />
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Location"
                        className="text-sm h-auto py-1 px-2"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-foreground mt-2">{formData.name || 'User'}</h1>
                      <p className="text-lg text-foreground/80 font-medium">{formData.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{formData.location}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">About</h3>
              {isOwnProfile && isEditMode ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself"
                  className="resize-none min-h-[80px] text-base"
                  maxLength={500}
                />
              ) : (
                <p className="text-foreground text-base leading-relaxed">
                  {formData.bio}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Skills & Expertise</h3>
              {isOwnProfile && isEditMode ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={formData.newSkill}
                      onChange={(e) => setFormData({...formData, newSkill: e.target.value})}
                      placeholder="Add a skill"
                      className="max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={addSkill}
                      className="bg-transparent"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Experience</h3>
                {isOwnProfile && isEditMode && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addExperience}
                    className="bg-transparent"
                  >
                    Add Experience
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {formData.experiences.map((exp, index) => (
                  <div key={exp.id} className={`border-l-2 ${index === 0 ? 'border-accent' : 'border-primary'} pl-4 relative`}>
                    {isOwnProfile && isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-card hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {isOwnProfile && isEditMode ? (
                      <div className="space-y-2">
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                          placeholder="Job title"
                          className="font-semibold"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Company"
                            className="flex-1"
                          />
                          <Input
                            value={exp.period}
                            onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                            placeholder="2021 - Present"
                            className="flex-1"
                          />
                        </div>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          placeholder="Describe your role and achievements..."
                          className="resize-none min-h-[60px]"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-foreground">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company} • {exp.period}</p>
                        <p className="text-sm text-foreground mt-2">{exp.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Education</h3>
                {isOwnProfile && isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newId = Math.max(...formData.education.map((e: any) => e.id), 0) + 1;
                      setFormData({
                        ...formData,
                        education: [...formData.education, { id: newId, degree: '', school: '', year: '' }]
                      });
                    }}
                    className="bg-transparent gap-2 h-8"
                  >
                    <Plus className="h-3 w-3" />
                    Add Education
                  </Button>
                )}
              </div>
              {isOwnProfile && isEditMode ? (
                <div className="space-y-4">
                  {formData.education.map((edu: any, index: number) => (
                    <div key={edu.id} className="space-y-3 p-4 pt-6 border border-border rounded-lg relative">
                      {formData.education.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              education: formData.education.filter((e: any) => e.id !== edu.id)
                            });
                          }}
                          className="absolute -top-3 right-2 h-7 w-7 text-muted-foreground hover:bg-destructive hover:text-white transition-colors rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = formData.education.map((e: any) => 
                            e.id === edu.id ? {...e, degree: e.target.value} : e
                          );
                          setFormData({...formData, education: updated});
                        }}
                        placeholder="Degree and Field of Study"
                      />
                      <Input
                        value={edu.school}
                        onChange={(e) => {
                          const updated = formData.education.map((e: any) => 
                            e.id === edu.id ? {...e, school: e.target.value} : e
                          );
                          setFormData({...formData, education: updated});
                        }}
                        placeholder="School or University"
                      />
                      <Input
                        value={edu.year}
                        onChange={(e) => {
                          const updated = formData.education.map((e: any) => 
                            e.id === edu.id ? {...e, year: e.target.value} : e
                          );
                          setFormData({...formData, education: updated});
                        }}
                        placeholder="Graduation Year"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.education.map((edu: any) => (
                    <div key={edu.id} className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-foreground">
                          {edu.school.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">{edu.school} • {edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Button - Bottom Right */}
            {isOwnProfile && !isEditMode && (
              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button 
                  variant="outline" 
                  className="gap-2 bg-transparent"
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            )}

            {/* Save/Cancel Buttons - Bottom Right */}
            {isOwnProfile && isEditMode && (
              <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                <Button 
                  variant="outline"
                  className="bg-transparent"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
