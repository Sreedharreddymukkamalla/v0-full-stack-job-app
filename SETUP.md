# AImploy Setup & Implementation Guide

## Project Overview

AImploy is a full-stack job networking platform that brings together job seekers, recruiters, and professionals. The frontend is built with Next.js 16, TypeScript, and Tailwind CSS with a polished, professional design system.

### Platform Capabilities

**For Job Seekers:**
- Browse curated job listings
- Apply to opportunities
- Get AI-powered career recommendations
- Connect with recruiters and professionals
- Track applications
- Participate in community discussions

**For Recruiters:**
- Post job opportunities
- Review applications
- Identify candidates
- Direct messaging with candidates
- Company profiles

**For Everyone:**
- Social feed for posts and insights
- Real-time messaging
- Professional networking
- Event discovery
- Group communities
- Profile management

## Frontend Architecture

### Color System (Professional Theme)
\`\`\`css
Primary: oklch(0.24 0.045 264) - Deep Navy Blue
Accent: oklch(0.65 0.12 192) - Teal/Cyan
Secondary: oklch(0.5 0.06 200) - Slate Blue
Background Light: oklch(0.98 0.001 0) - Off-white
Background Dark: oklch(0.1 0.008 264) - Deep Navy

Dark Mode:
- Background: Deep Navy (#1A1F35 equivalent)
- Text: Light Gray (#F5F5F5 equivalent)
- Cards: Slightly lighter navy (#2A2F45 equivalent)
\`\`\`

### Component Hierarchy

\`\`\`
Root Layout
├── Landing Page (/)
├── Auth Pages
│   ├── SignIn (/signin)
│   └── SignUp (/signup)
└── App Layout (/(app))
    ├── Sidebar Navigation
    ├── Header (Search + Notifications)
    └── Page Content
        ├── Feed (/page)
        ├── Jobs (/jobs)
        ├── Messages (/messages)
        ├── Agent (/agent)
        ├── Profile (/profile)
        ├── Settings (/settings)
        ├── Companies (/companies)
        ├── Events (/events)
        ├── Users (/users)
        ├── Groups (/groups)
        └── Notifications (/notifications)
\`\`\`

## Routing Structure

### Public Routes
- `/` - Landing page (shown to unauthenticated users)
- `/signin` - Sign in form
- `/signup` - Sign up form

### Protected Routes (/(app))
All routes under `/(app)` should require authentication:

- `/` - Feed/Home timeline
- `/jobs` - Job listings
- `/jobs/[id]` - Job detail (to be implemented)
- `/messages` - Messaging interface
- `/messages/[id]` - Individual conversation (to be implemented)
- `/agent` - AI Assistant chat
- `/profile` - Current user profile
- `/profile/[id]` - Other user profiles (to be implemented)
- `/settings` - Account settings
- `/companies` - Company directory
- `/companies/[id]` - Company detail (to be implemented)
- `/events` - Events listing
- `/events/[id]` - Event detail (to be implemented)
- `/users` - User discovery
- `/groups` - Community groups
- `/groups/[id]` - Group detail (to be implemented)
- `/notifications` - Notification center
- `/search` - Global search results (to be implemented)

## Key Features Implemented

### ✅ UI Components
- Professional header with search
- Collapsible sidebar navigation
- Card-based layouts
- Form inputs and textarea
- Buttons with variants
- Badges and tabs
- Avatars and user cards

### ✅ Pages
- **Landing Page**: Hero section, features, CTA, footer
- **SignIn/SignUp**: Email forms, OAuth buttons, validations
- **Feed**: Post composer, posts list, reactions
- **Jobs**: Job listing cards, filtering, application tracking
- **Messages**: Conversation list, chat interface, message input
- **AI Agent**: Chat interface, conversation history
- **Profiles**: User profile with experience, skills, posts
- **Settings**: Preferences, privacy, appearance
- **Companies**: Company cards, job counts, follow option
- **Events**: Event listings, speaker info, RSVP
- **Users**: User discovery, connection options
- **Groups**: Community groups, join/leave actions
- **Notifications**: Activity feed with actions

### ✅ Design System
- Consistent color palette
- Responsive layouts (mobile-first)
- Dark/light mode support
- Accessibility features
- Loading states
- Empty states

## Implementation Steps

### Phase 1: Backend Setup (After Frontend)

1. **Database Schema**
\`\`\`sql
-- Core tables needed
users (id, email, firstName, lastName, avatar, bio, createdAt)
profiles (userId, title, location, bio, skills)
posts (id, authorId, content, image, createdAt)
jobs (id, companyId, title, description, location, type, level)
applications (id, userId, jobId, status, createdAt)
messages (id, conversationId, senderId, content, createdAt)
conversations (id, participantIds, updatedAt)
companies (id, name, description, website, location)
events (id, title, date, speakers, attendees)
groups (id, name, description, members)
notifications (id, userId, type, title, link, read, createdAt)
\`\`\`

2. **Authentication**
- Implement JWT or session-based auth
- OAuth integration (GitHub, LinkedIn)
- Password hashing with bcrypt
- Email verification

3. **API Endpoints**
\`\`\`
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/logout

GET /api/users/me
PUT /api/users/me
GET /api/users/:id

GET /api/posts/feed
POST /api/posts
GET /api/posts/:id

GET /api/jobs
GET /api/jobs/:id
POST /api/applications

GET /api/messages/conversations
GET /api/messages/conversations/:id
POST /api/messages

GET /api/companies
GET /api/companies/:id

GET /api/agent/execute
GET /api/agent/history
\`\`\`

4. **Real-time Features**
- WebSocket for messaging
- Real-time notifications
- Message read receipts
- Typing indicators

### Phase 2: AI Integration

1. **AI Agent Features**
- Resume optimization suggestions
- Job matching and recommendations
- Interview preparation
- Career advice
- Conversation summarization

2. **RAG (Retrieval-Augmented Generation)**
- Index job descriptions
- Index company information
- Index user experiences
- Enable contextual AI responses

### Phase 3: ATS Integration

1. **Ashby Integration**
- Import job listings
- Track applications
- Update candidate status
- Sync interview schedules

2. **Greenhouse Integration**
- Similar to Ashby
- Custom field mapping

## Environment Variables

Create `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXT_PUBLIC_GITHUB_ID=your_github_id
NEXT_PUBLIC_LINKEDIN_ID=your_linkedin_id

# AI/LLM (if using AI SDK)
NEXT_PUBLIC_AI_GATEWAY_URL=https://gateway.ai.cloudflare.com
AI_GATEWAY_API_KEY=your_api_key

# Optional: Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

## Database Integration

### Recommended Stack
- **Supabase**: All-in-one (Auth + DB + Real-time)
- **Neon**: PostgreSQL with scaling
- **PlanetScale**: MySQL compatible

### Alternative with Custom Backend
- FastAPI (Python) or Node.js backend
- PostgreSQL database
- Redis for caching
- Socket.io for real-time

## Deployment Checklist

- [ ] Set up backend API
- [ ] Configure database
- [ ] Set environment variables
- [ ] Test authentication flow
- [ ] Implement email verification
- [ ] Set up error logging (Sentry)
- [ ] Configure CDN for assets
- [ ] Set up analytics
- [ ] Enable CORS properly
- [ ] Test on multiple devices
- [ ] Deploy to Vercel

## File Structure Summary

\`\`\`
aimploy/
├── app/
│   ├── (app)/              # Protected routes with sidebar
│   ├── signin/             # Auth pages
│   ├── signup/
│   ├── landing.tsx         # Landing page component
│   ├── page.tsx            # Home (routes to landing or feed)
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles + theme
├── components/
│   ├── app-sidebar.tsx     # Navigation sidebar
│   ├── app-layout.tsx      # App wrapper
│   ├── header.tsx          # Top header
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── utils.ts            # Utility functions (cn)
│   ├── api.ts              # API helper functions
│   └── supabaseClient.ts   # Supabase client (when added)
├── types/
│   └── index.ts            # TypeScript type definitions
├── public/                 # Static assets
├── README.md               # Project documentation
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.ts
\`\`\`

## Next Features to Implement

1. **User Authentication**
   - Connected auth flow
   - User sessions
   - Permission guards

2. **Job Application Workflow**
   - Resume upload
   - Application tracking
   - Status updates
   - Interview scheduling

3. **Advanced Search**
   - Full-text search across jobs, posts, users
   - Filters and refinements
   - Saved searches

4. **Notifications Enhancement**
   - Real-time delivery
   - Email notifications
   - Push notifications

5. **Analytics**
   - User engagement metrics
   - Job application funnel
   - Platform insights

## Development Workflow

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy
npm run deploy
# or just push to GitHub for Vercel auto-deploy
\`\`\`

## Support & Resources

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **TypeScript**: https://www.typescriptlang.org
- **Lucide Icons**: https://lucide.dev

## Notes

- All styling uses semantic design tokens (CSS variables)
- Full dark mode support built-in
- Responsive design works on all devices
- Performance optimized with code splitting
- Accessibility features included (ARIA labels, semantic HTML)
- Ready for backend integration with clean API abstraction layer
