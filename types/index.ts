/**
 * Type definitions for AImploy platform
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author?: User;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  level: 'Junior' | 'Mid-level' | 'Senior';
  skills: string[];
  companyId: string;
  createdAt: string;
  postedBy: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';
  resume?: string;
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachment?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  location: string;
  employees: string;
  logo?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  speakers: string[];
  attendees: number;
  registered?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  joined?: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'application' | 'message' | 'connection' | 'job' | 'post';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
