/**
 * Mock Data for Development
 * Use these credentials to test the app without a backend
 */

export const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'demo123456',
    name: 'John Developer',
    role: 'job_seeker',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    title: 'Full Stack Engineer',
    company: 'Tech Corp',
    bio: 'Passionate about building scalable applications',
    location: 'San Francisco, CA',
  },
];

export const MOCK_MESSAGES = [
  {
    id: '1',
    sender_id: '2',
    receiver_id: '1',
    content: 'Hi John! Your profile caught my attention. Are you interested in a Senior Engineer role?',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: '2',
    sender_id: '1',
    receiver_id: '2',
    content: 'Hi Sarah! Thanks for reaching out. I would love to learn more about the opportunity.',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: '3',
    sender_id: '2',
    receiver_id: '1',
    content: 'Great! The role involves leading a team of 5 engineers. Interested in a call?',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false,
  },
];

export const MOCK_CONVERSATIONS = [
  {
    id: '1',
    user_id: '2',
    name: 'Sarah Recruiter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    last_message: 'Great! The role involves leading a team of 5 engineers. Interested in a call?',
    last_message_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    unread_count: 1,
  },
  {
    id: '2',
    user_id: '3',
    name: 'Mike Manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    last_message: 'Thanks for applying! We will review and get back to you soon.',
    last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread_count: 0,
  },
];

export const MOCK_COMPANIES = [
  {
    id: '1',
    name: 'Tech Talents Inc',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TT',
    description: 'Leading recruitment platform for tech professionals',
    industry: 'HR Tech',
    size: '50-200',
    location: 'San Francisco, CA',
    website: 'https://techtalents.com',
  },
  {
    id: '2',
    name: 'Innovation Labs',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=IL',
    description: 'Building next-generation software solutions',
    industry: 'Software Development',
    size: '200-500',
    location: 'Austin, TX',
    website: 'https://innovationlabs.com',
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'message',
    title: 'New Message from Sarah',
    description: 'Are you interested in a Senior Engineer role?',
    read: false,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'application',
    title: 'Application Update',
    description: 'Your application has been moved to the next round',
    read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'job',
    title: 'New Job Recommendation',
    description: 'Senior Full Stack Engineer at Tech Corp',
    read: true,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];
