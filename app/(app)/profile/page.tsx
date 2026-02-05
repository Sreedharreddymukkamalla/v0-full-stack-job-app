'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Check, X, Camera, ThumbsUp, MessageCircle, Share2, Plus, Pencil, Trash2 } from 'lucide-react';
import { getProfile, loadProfileFromApi } from '@/lib/profileStore';
import { formatTimeAgo } from '@/lib/utils'; // Assuming formatTimeAgo is declared in utils.js

export default function ProfilePage() {
  const [currentProfile, setCurrentProfile] = useState<any>(() => getProfile());
  const isSelfProfile = true; // This would normally check if viewing own profile
  
  // State for section-wise editing
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<any>({
    name: '',
    title: '',
    location: '',
    bio: '',
    skills: [] as string[],
    newSkill: '',
  });

  const [experienceData, setExperienceData] = useState<any[]>([]);
  const [educationData, setEducationData] = useState<any[]>([]);

  // Load profile into local state on mount (re-populates after reload)
  useEffect(() => {
    if (currentProfile) {
      // already have it
      return;
    }

    loadProfileFromApi().then((p) => {
      if (p) setCurrentProfile(p);
    }).catch(() => null);
  }, []);

  // When profile is available, map it into the form states
  useEffect(() => {
    if (!currentProfile) return;

    const p = currentProfile;
    const mappedExperiences = (p.experience?.experience || []).map((e: any, idx: number) => ({
      id: e.id || `exp-${idx}`,
      title: e.title || e.job_title || '',
      company: e.company || '',
      period: `${e.startDate || e.start || ''} - ${e.endDate || e.end || 'Present'}`,
      description: e.description || '',
    }));

    const mappedEducation = (p.experience?.education || []).map((ed: any, idx: number) => ({
      id: ed.id || `edu-${idx}`,
      degree: ed.degree || ed.field || '',
      school: ed.school || '',
      year: ed.endDate || ed.year || '',
    }));

    setProfileData({
      name: p.full_name || p.name || p.user?.full_name || '',
      title: p.headline || p.title || '',
      location: p.location || '',
      bio: p.summary || p.about || '',
      skills: p.skills || [],
      newSkill: '',
    });
    
    setExperienceData(mappedExperiences);
    setEducationData(mappedEducation);
  }, [currentProfile]);

  const handleSaveSection = (section: string) => {
    console.log(`[v0] Saving ${section}:`, {
      profile: section === 'profile' ? profileData : null,
      experience: section === 'experience' ? experienceData : null,
      education: section === 'education' ? educationData : null,
      skills: section === 'skills' ? profileData.skills : null
    });
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const addSkill = () => {
    if (profileData.newSkill.trim()) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, profileData.newSkill.trim()],
        newSkill: ''
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s !== skillToRemove)
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
    setExperienceData([newExp, ...experienceData]);
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setExperienceData(
      experienceData.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeExperience = (id: number) => {
    setExperienceData(experienceData.filter(exp => exp.id !== id));
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-5xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-6 relative">
          {/* Banner */}
          <div className="h-56 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient relative group">
            {/* Edit Cover Photo Button */}
            {isSelfProfile && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                onClick={() => document.getElementById('cover-upload')?.click()}
              >
                <Camera className="h-4 w-4" />
                Edit Cover
              </Button>
            )}
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
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between -mt-20 relative z-10 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="relative">
                <Avatar className="h-36 w-36 border-4 border-card ring-4 ring-background shadow-xl group">
                  <AvatarImage src={currentProfile?.profile_image_url || currentProfile?.profile_image || currentProfile?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{(profileData.name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                {isSelfProfile && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => document.getElementById('avatar-upload-direct')?.click()}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload-direct"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('[v0] Profile photo selected:', file.name);
                    }
                  }}
                />
                {isEditMode && (
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
                  <>
                    <h1 className="text-3xl font-bold text-foreground mt-2">{profileData.name || 'John Doe'}</h1>
                    <p className="text-lg text-foreground/80 font-medium">{profileData.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{profileData.location}</p>
                  </>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">About</h3>
                {isSelfProfile && editingSection !== 'about' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSection('about')}
                    className="bg-transparent gap-2 h-8"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              {editingSection === 'about' ? (
                <div className="space-y-2">
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about yourself"
                    className="resize-none min-h-[80px] text-base"
                    maxLength={500}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleSaveSection('about')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground text-base leading-relaxed">
                  {profileData.bio}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Skills & Expertise</h3>
                {isSelfProfile && editingSection !== 'skills' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSection('skills')}
                    className="bg-transparent gap-2 h-8"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              {editingSection === 'skills' ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill) => (
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
                      value={profileData.newSkill}
                      onChange={(e) => setProfileData({...profileData, newSkill: e.target.value})}
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
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleSaveSection('skills')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Experience</h3>
                {isSelfProfile && editingSection !== 'experience' && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingSection('experience')}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                    {experienceData.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingSection('experience')}
                        className="bg-transparent gap-2 h-8"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {editingSection === 'experience' ? (
                <div className="space-y-4">
                  {experienceData.map((exp, index) => (
                    <div key={exp.id} className={`border-l-2 ${index === 0 ? 'border-accent' : 'border-primary'} pl-4 relative`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-card hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
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
                    </div>
                  ))}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleSaveSection('experience')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {experienceData.map((exp, index) => (
                    <div key={exp.id} className={`border-l-2 ${index === 0 ? 'border-accent' : 'border-primary'} pl-4`}>
                      <h4 className="font-semibold text-foreground">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company} • {exp.period}</p>
                      <p className="text-sm text-foreground mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Education</h3>
                {isSelfProfile && editingSection !== 'education' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection('education')}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                    {educationData.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSection('education')}
                        className="bg-transparent gap-2 h-8"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {editingSection === 'education' ? (
                <div className="space-y-4">
                  {educationData.map((edu: any, index: number) => (
                    <div key={edu.id} className="space-y-3 p-4 pt-6 border border-border rounded-lg relative">
                      {educationData.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEducationData(
                              educationData.filter((e: any) => e.id !== edu.id)
                            );
                          }}
                          className="absolute -top-3 right-2 h-7 w-7 text-muted-foreground hover:bg-destructive hover:text-white transition-colors rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = educationData.map((ed: any) => 
                            ed.id === edu.id ? {...ed, degree: e.target.value} : ed
                          );
                          setEducationData(updated);
                        }}
                        placeholder="Degree and Field of Study"
                      />
                      <Input
                        value={edu.school}
                        onChange={(e) => {
                          const updated = educationData.map((ed: any) => 
                            ed.id === edu.id ? {...ed, school: e.target.value} : ed
                          );
                          setEducationData(updated);
                        }}
                        placeholder="School or University"
                      />
                      <Input
                        value={edu.year}
                        onChange={(e) => {
                          const updated = educationData.map((ed: any) => 
                            ed.id === edu.id ? {...ed, year: e.target.value} : ed
                          );
                          setEducationData(updated);
                        }}
                        placeholder="Graduation Year"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newId = educationData.length > 0 ? Math.max(...educationData.map((e: any) => e.id)) + 1 : 1;
                        setEducationData([
                          ...educationData,
                          { id: newId, degree: '', school: '', year: '' }
                        ]);
                      }}
                    className="bg-transparent gap-2 h-8"
                  >
                    <Plus className="h-3 w-3" />
                    Add Education
                  </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleSaveSection('education')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {educationData.map((edu: any) => (
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
          </div>
        </Card>
      </div>
    </div>
  );
}
