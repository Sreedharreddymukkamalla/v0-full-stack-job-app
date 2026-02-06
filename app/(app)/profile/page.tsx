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
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [editingExperienceOriginal, setEditingExperienceOriginal] = useState<any | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
  const [editingEducationOriginal, setEditingEducationOriginal] = useState<any | null>(null);
  const [skillsBackup, setSkillsBackup] = useState<string[] | null>(null);
  
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
    if (section === 'skills') setSkillsBackup(null);
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    if (editingSection === 'skills') {
      if (skillsBackup) {
        setProfileData({...profileData, skills: skillsBackup, newSkill: ''});
        setSkillsBackup(null);
      }
      setEditingSection(null);
      return;
    }
    // If cancelling a section-level edit for experience/education, remove any newly-added blank entries
    if (editingSection === 'experience') {
      setExperienceData(experienceData.filter(exp => {
        const t = (exp.title || '').toString().trim();
        const c = (exp.company || '').toString().trim();
        const p = (exp.period || '').toString().trim();
        const d = (exp.description || '').toString().trim();
        return !(t === '' && c === '' && p === '' && d === '');
      }));
    }
    if (editingSection === 'education') {
      setEducationData(educationData.filter(ed => {
        const deg = (ed.degree || '').toString().trim();
        const school = (ed.school || '').toString().trim();
        const year = (ed.year || '').toString().trim();
        return !(deg === '' && school === '' && year === '');
      }));
    }
    setEditingSection(null);
  };

  const startEditSkills = () => {
    setSkillsBackup(profileData.skills ? [...profileData.skills] : []);
    setEditingSection('skills');
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
    // open the newly created form for editing
    setEditingExperienceId(newExp.id);
    setEditingExperienceOriginal(null);
  };

  const addEducation = () => {
    const newEdu = { id: Date.now(), degree: '', school: '', year: '' };
    setEducationData([newEdu, ...educationData]);
    setEditingEducationId(newEdu.id);
    setEditingEducationOriginal(null);
  };

  const startEditExperience = (id: number) => {
    const orig = experienceData.find((e) => e.id === id);
    setEditingExperienceOriginal(orig ? { ...orig } : null);
    setEditingExperienceId(id);
  };

  const cancelEditExperience = (id: number) => {
    if (editingExperienceOriginal) {
      setExperienceData(
        experienceData.map((exp) => (exp.id === id ? editingExperienceOriginal : exp))
      );
    } else {
      // newly created entry — remove it
      setExperienceData(experienceData.filter((exp) => exp.id !== id));
    }
    setEditingExperienceId(null);
    setEditingExperienceOriginal(null);
  };

  const saveEditExperience = (id: number) => {
    // In a full app we'd persist to the API here.
    console.log('[v0] Saved experience', experienceData.find(e => e.id === id));
    setEditingExperienceId(null);
    setEditingExperienceOriginal(null);
  };

  const startEditEducation = (id: number) => {
    const orig = educationData.find((e) => e.id === id);
    setEditingEducationOriginal(orig ? { ...orig } : null);
    setEditingEducationId(id);
  };

  const cancelEditEducation = (id: number) => {
    if (editingEducationOriginal) {
      setEducationData(
        educationData.map((ed) => (ed.id === id ? editingEducationOriginal : ed))
      );
    } else {
      // newly created entry — remove it
      setEducationData(educationData.filter((ed) => ed.id !== id));
    }
    setEditingEducationId(null);
    setEditingEducationOriginal(null);
  };

  const saveEditEducation = (id: number) => {
    console.log('[v0] Saved education', educationData.find(e => e.id === id));
    setEditingEducationId(null);
    setEditingEducationOriginal(null);
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

  const renderDescription = (desc?: string | null) => {
    if (!desc) return null;
    const lines = desc.split(/\r?\n/);
    const elements: any[] = [];
    let listBuffer: string[] = [];

    const flushList = (key: string) => {
      if (listBuffer.length === 0) return;
      elements.push(
        <ul key={key} className="list-disc ml-5 text-sm text-foreground">
          {listBuffer.map((li, i) => (
            <li key={`${key}-li-${i}`}>{li}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    };

    lines.forEach((raw, idx) => {
      const line = raw.replace(/\t+/g, ' ').trimRight();
      const trimmed = line.trim();
      if (trimmed.match(/^[-*+]\s+/)) {
        // list item
        listBuffer.push(trimmed.replace(/^[-*+]\s+/, ''));
      } else if (trimmed === '') {
        // blank line -> flush any list and add a small spacer
        flushList(`list-${idx}`);
        elements.push(<div key={`br-${idx}`} className="h-2" />);
      } else {
        // regular paragraph line
        flushList(`list-${idx}`);
        elements.push(
          <p key={`p-${idx}`} className="text-sm text-foreground mt-2">
            {line}
          </p>
        );
      }
    });

    flushList('last');
    return elements;
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-4 relative gap-0">
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
            <div className="flex flex-col md:flex-row md:items-start md:justify-start relative z-10 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="relative -mt-20 z-20">
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
              </div>
              </div>
                <div className="mt--2 ml-2">
                  <h1 className="text-lg font-bold text-foreground/80 mt-2">{profileData.name || 'John Doe'}</h1>
                  <p className="text-lg text-foreground/80 font-medium">{profileData.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{profileData.location}</p>
                </div>
            </div>

            {/* About */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">About</h3>
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
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
            <div className="mb-6 group relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Skills & Expertise</h3>
              </div>
              {isSelfProfile && editingSection !== 'skills' && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={startEditSkills}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
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
                  <div className="flex gap-2 items-center">
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
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelEdit}
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
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
                {isSelfProfile && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addExperience()}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
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
                          className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
                      <div key={exp.id} className={`group border-l-2 ${index === 0 ? 'border-accent' : 'border-primary'} pl-4 relative`}>
                        {editingExperienceId === exp.id ? (
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
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => cancelEditExperience(exp.id)} className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                <X className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => saveEditExperience(exp.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          ) : (
                          <>
                            <h4 className="font-semibold text-foreground">{exp.title}</h4>
                            <p className="text-sm text-muted-foreground">{exp.company} • {exp.period}</p>
                            {renderDescription(exp.description)}
                            {isSelfProfile && (
                              <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => startEditExperience(exp.id)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
              )}
            </div>

            {/* Education */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Education</h3>
                {isSelfProfile && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEducation()}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
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
                          className="absolute -top-3 right-2 h-7 w-7 rounded-full bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center"
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
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
                    <div key={edu.id} className="group flex items-start gap-3 relative">
                      {editingEducationId === edu.id ? (
                        <div className="w-full space-y-3 p-4 pt-0">
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
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => cancelEditEducation(edu.id)} className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground">
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => saveEditEducation(edu.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        ) : (
                        <>
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-foreground">
                              {edu.school.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                            <p className="text-sm text-muted-foreground">{edu.school} • {edu.year}</p>
                          </div>
                          {isSelfProfile && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" onClick={() => startEditEducation(edu.id)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => {
                                setEducationData(educationData.filter((e: any) => e.id !== edu.id));
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
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
