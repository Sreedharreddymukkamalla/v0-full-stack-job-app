'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Plus, X, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export default function ResumePage() {
  const currentUser = getCurrentUser();
  const resumeRef = useRef<HTMLDivElement>(null);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: currentUser?.name || '',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'johndoe.com',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    summary: 'Experienced software engineer with 5+ years of expertise in building scalable web applications. Specialized in React, TypeScript, and cloud technologies. Passionate about creating elegant solutions to complex problems.'
  });

  const [skills, setSkills] = useState(['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL']);
  const [newSkill, setNewSkill] = useState('');

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: '2021-01',
      endDate: '2024-01',
      current: false,
      description: '• Led development of microservices architecture serving 10M+ users\n• Improved application performance by 40% through optimization\n• Mentored team of 5 junior engineers'
    }
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California',
      location: 'Berkeley, CA',
      graduationDate: '2019',
      gpa: '3.8'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce platform with real-time inventory management',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      link: 'github.com/project'
    }
  ]);

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addEducation = () => {
    setEducation([...education, {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: ''
    }]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const addProject = () => {
    setProjects([...projects, {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      link: ''
    }]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(proj => proj.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setProjects(projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    ));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleDownload = () => {
    console.log('[v0] Downloading resume as PDF...');
    // In a real implementation, this would generate a PDF
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Resume Builder</h1>
            <p className="text-muted-foreground mt-1">Create and customize your professional resume</p>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
              <div className="space-y-3">
                <Input
                  placeholder="Full Name"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                  className="h-11"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    className="h-11"
                  />
                </div>
                <Input
                  placeholder="Location"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                  className="h-11"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Website"
                    value={personalInfo.website}
                    onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="LinkedIn"
                    value={personalInfo.linkedin}
                    onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                    className="h-11"
                  />
                </div>
                <Input
                  placeholder="GitHub"
                  value={personalInfo.github}
                  onChange={(e) => setPersonalInfo({...personalInfo, github: e.target.value})}
                  className="h-11"
                />
                <Textarea
                  placeholder="Professional Summary"
                  value={personalInfo.summary}
                  onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                  className="resize-none min-h-[100px]"
                />
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Skills</h2>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
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
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="h-11"
                  />
                  <Button onClick={addSkill} variant="outline" className="bg-transparent">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Experience */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Experience</h2>
                <Button onClick={addExperience} size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-3 p-4 border border-border rounded-lg">
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      className="h-11"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="h-11"
                      />
                      <Input
                        placeholder="Location"
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="month"
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="h-11"
                      />
                      <Input
                        type="month"
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                        className="h-11"
                      />
                    </div>
                    <Textarea
                      placeholder="Description (use bullet points with •)"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="resize-none min-h-[100px]"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Education */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Education</h2>
                <Button onClick={addEducation} size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-3 p-4 border border-border rounded-lg">
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="h-11"
                    />
                    <Input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      className="h-11"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Location"
                        value={edu.location}
                        onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                        className="h-11"
                      />
                      <Input
                        placeholder="Graduation Year"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <Input
                      placeholder="GPA (optional)"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      className="h-11"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Projects */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Projects</h2>
                <Button onClick={addProject} size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="space-y-3 p-4 border border-border rounded-lg">
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => removeProject(proj.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Project Name"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                      className="h-11"
                    />
                    <Textarea
                      placeholder="Project Description"
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                      className="resize-none min-h-[60px]"
                    />
                    <Input
                      placeholder="Technologies (comma-separated)"
                      value={proj.technologies.join(', ')}
                      onChange={(e) => updateProject(proj.id, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                      className="h-11"
                    />
                    <Input
                      placeholder="Project Link"
                      value={proj.link}
                      onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                      className="h-11"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <Card className="p-8 h-full overflow-y-auto" ref={resumeRef}>
              <div className="max-w-[800px] mx-auto space-y-6">
                {/* Header */}
                <div className="text-center border-b-2 border-primary pb-4">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{personalInfo.fullName || 'Your Name'}</h1>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {personalInfo.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{personalInfo.email}</span>
                      </div>
                    )}
                    {personalInfo.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{personalInfo.phone}</span>
                      </div>
                    )}
                    {personalInfo.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{personalInfo.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    {personalInfo.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        <span>{personalInfo.website}</span>
                      </div>
                    )}
                    {personalInfo.linkedin && (
                      <div className="flex items-center gap-1">
                        <Linkedin className="h-3.5 w-3.5" />
                        <span>{personalInfo.linkedin}</span>
                      </div>
                    )}
                    {personalInfo.github && (
                      <div className="flex items-center gap-1">
                        <Github className="h-3.5 w-3.5" />
                        <span>{personalInfo.github}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {personalInfo.summary && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b border-border pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
                    <p className="text-sm text-foreground leading-relaxed">{personalInfo.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b border-border pb-1 mb-2">SKILLS</h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="text-sm text-foreground">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {experiences.length > 0 && experiences.some(exp => exp.title) && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b border-border pb-1 mb-3">EXPERIENCE</h2>
                    <div className="space-y-4">
                      {experiences.filter(exp => exp.title).map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="font-semibold text-foreground">{exp.title}</h3>
                              <p className="text-sm text-muted-foreground">{exp.company}{exp.location && ` • ${exp.location}`}</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                              {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              {' - '}
                              {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                            </p>
                          </div>
                          {exp.description && (
                            <div className="text-sm text-foreground whitespace-pre-line mt-1">
                              {exp.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && education.some(edu => edu.degree) && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b border-border pb-1 mb-3">EDUCATION</h2>
                    <div className="space-y-3">
                      {education.filter(edu => edu.degree).map((edu) => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                              <p className="text-sm text-muted-foreground">{edu.institution}{edu.location && ` • ${edu.location}`}</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                              {edu.graduationDate}
                              {edu.gpa && ` • GPA: ${edu.gpa}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {projects.length > 0 && projects.some(proj => proj.name) && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b border-border pb-1 mb-3">PROJECTS</h2>
                    <div className="space-y-3">
                      {projects.filter(proj => proj.name).map((proj) => (
                        <div key={proj.id}>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-foreground">{proj.name}</h3>
                            {proj.link && (
                              <p className="text-sm text-primary underline ml-4">{proj.link}</p>
                            )}
                          </div>
                          {proj.description && (
                            <p className="text-sm text-foreground mb-1">{proj.description}</p>
                          )}
                          {proj.technologies.length > 0 && proj.technologies[0] !== '' && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Technologies:</span> {proj.technologies.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
