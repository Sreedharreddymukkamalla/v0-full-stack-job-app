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

  // When profile is available, map it into the form state
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

    setFormData({
      name: p.full_name || p.name || p.user?.full_name || '',
      title: p.headline || p.title || '',
      location: p.location || '',
      bio: p.summary || p.about || '',
      skills: p.skills || [],
      newSkill: '',
      experiences: mappedExperiences,
      education: mappedEducation,
    });
  }, [currentProfile]);

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

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-5xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-6 relative">
          {/* Banner */}
          <div className="h-56 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient relative group">
            {/* Edit Cover Photo Button */}
            {isSelfProfile && !isEditMode && (
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
            {!isEditMode && (
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

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between -mt-20 relative z-10 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="relative">
                <Avatar className="h-36 w-36 border-4 border-card ring-4 ring-background shadow-xl group">
                  <AvatarImage src={currentProfile?.profile_image_url || currentProfile?.profile_image || currentProfile?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{(formData.name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                {isSelfProfile && !isEditMode && (
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
                      {isEditMode ? (
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
                      <h1 className="text-3xl font-bold text-foreground mt-2">{formData.name || 'John Doe'}</h1>
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
              {isEditMode ? (
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
              {isEditMode ? (
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
                {isSelfProfile && !isEditMode && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                    {formData.experiences.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditMode(true)}
                        className="bg-transparent gap-2 h-8"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
                {isEditMode && (
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
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-card hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {isEditMode ? (
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

            {/* Keeping original static experience for reference - will be removed */}
            <div className="mb-6 hidden">
              <h3 className="font-semibold text-foreground mb-4">Experience</h3>
              <div className="space-y-4">
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-foreground">Senior Frontend Engineer</h4>
                  <p className="text-sm text-muted-foreground">Vercel • 2021 - Present</p>
                  <p className="text-sm text-foreground mt-2">Led development of core platform features serving 2M+ developers. Improved performance by 40%.</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Frontend Engineer</h4>
                  <p className="text-sm text-muted-foreground">Stripe • 2018 - 2021</p>
                  <p className="text-sm text-foreground mt-2">Built developer-facing APIs and dashboards. Mentored 5 junior engineers.</p>
                </div>
                <div className="border-l-2 border-secondary pl-4">
                  <h4 className="font-semibold text-foreground">Junior Developer</h4>
                  <p className="text-sm text-muted-foreground">Startup XYZ • 2016 - 2018</p>
                  <p className="text-sm text-foreground mt-2">Started career building full-stack features for seed-stage startup.</p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Education</h3>
                {isSelfProfile && !isEditMode && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                    {formData.education.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditMode(true)}
                        className="bg-transparent gap-2 h-8"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
                {isEditMode && (
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
              {isEditMode ? (
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
            {isSelfProfile && !isEditMode && (
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
            
            {isSelfProfile && isEditMode && (
              <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  className="gap-2"
                  onClick={handleSave}
                >
                  <Check className="h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Posts Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Recent Posts</h2>
          <div className="space-y-4">
            {[
              {
                id: 1,
                content: 'Just completed a workshop on advanced React patterns. The key takeaway: composition over inheritance leads to more maintainable code.',
                likes: 45,
                comments: 12,
                shares: 5,
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
              },
              {
                id: 2,
                content: 'Excited to announce that I will be speaking at React Conf 2024! Looking forward to sharing insights on building scalable applications.',
                likes: 89,
                comments: 24,
                shares: 15,
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
              }
            ].map((post) => (
              <Card key={post.id} className="p-5 shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-border">
                      <AvatarImage src={currentProfile?.profile_image_url || "https://github.com/shadcn.png"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {currentProfile?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{currentProfile?.full_name}</p>
                      <p className="text-sm text-muted-foreground leading-tight">{formData.title}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-foreground leading-relaxed mb-4">{post.content}</p>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground py-2 border-y border-border/50">
                  <span>{post.likes} likes</span>
                  <div className="flex gap-3">
                    <span>{post.comments} comments</span>
                    <span>{post.shares} shares</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-around pt-2">
                  <Button variant="ghost" className="flex-1 gap-2 rounded-lg hover:bg-secondary h-10">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-medium">Like</span>
                  </Button>
                  <Button variant="ghost" className="flex-1 gap-2 rounded-lg hover:bg-secondary h-10">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">Comment</span>
                  </Button>
                  <Button variant="ghost" className="flex-1 gap-2 rounded-lg hover:bg-secondary h-10">
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium">Share</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
