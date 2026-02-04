'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Check, X } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default function ProfilePage() {
  const currentUser = getCurrentUser();
  const isSelfProfile = true; // This would normally check if viewing own profile
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    title: 'Senior Frontend Engineer',
    location: 'San Francisco, CA',
    bio: 'Passionate full-stack engineer with 8+ years building scalable web applications.',
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL', 'PostgreSQL', 'AWS', 'Docker', 'System Design'],
    newSkill: '',
    experiences: [
      {
        id: 1,
        title: 'Senior Frontend Engineer',
        company: 'Vercel',
        period: '2021 - Present',
        description: 'Led development of core platform features serving 2M+ developers. Improved performance by 40%.'
      },
      {
        id: 2,
        title: 'Frontend Engineer',
        company: 'Shopify',
        period: '2018 - 2021',
        description: 'Built merchant-facing features and improved checkout conversion rates by 25%.'
      }
    ]
  });

  const handleSave = () => {
    console.log('[v0] Saving profile:', formData);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      title: 'Senior Frontend Engineer',
      location: 'San Francisco, CA',
      bio: 'Passionate full-stack engineer with 8+ years building scalable web applications.',
      skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL', 'PostgreSQL', 'AWS', 'Docker', 'System Design'],
      newSkill: '',
      experiences: [
        {
          id: 1,
          title: 'Senior Frontend Engineer',
          company: 'Vercel',
          period: '2021 - Present',
          description: 'Led development of core platform features serving 2M+ developers. Improved performance by 40%.'
        },
        {
          id: 2,
          title: 'Frontend Engineer',
          company: 'Shopify',
          period: '2018 - 2021',
          description: 'Built merchant-facing features and improved checkout conversion rates by 25%.'
        }
      ]
    });
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
        <Card className="overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient" />

          {/* Profile Info */}
          <div className="px-6 pb-6 pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between -mt-16 relative z-10 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <Avatar className="h-32 w-32 border-4 border-card ring-2 ring-primary/20">
                  <AvatarImage src={currentUser?.avatar || "https://github.com/shadcn.png"} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
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
                      <h1 className="text-3xl font-bold text-foreground">{formData.name || 'John Doe'}</h1>
                      <p className="text-lg text-muted-foreground">{formData.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{formData.location}</p>
                    </>
                  )}
                </div>
              </div>
              {isSelfProfile && (
                <div className="flex gap-2 mt-4 md:mt-0">
                  {isEditMode ? (
                    <>
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
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="gap-2 bg-transparent"
                      onClick={() => setIsEditMode(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="mb-6">
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
            <div>
              <h3 className="font-semibold text-foreground mb-3">Education</h3>
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-foreground">UC</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Computer Science, B.S.</h4>
                  <p className="text-sm text-muted-foreground">University of California, Berkeley • 2016</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Recent Posts</h2>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6">
                <p className="text-foreground mb-3">
                  Just completed a workshop on advanced React patterns. The key takeaway: composition over inheritance leads to more maintainable code.
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <button className="hover:text-primary transition-colors">Like</button>
                  <button className="hover:text-primary transition-colors">Comment</button>
                  <button className="hover:text-primary transition-colors">Share</button>
                </div>
          </Card>
        ))}
          </div>
        </div>
      </div>


    </div>
  );
}
