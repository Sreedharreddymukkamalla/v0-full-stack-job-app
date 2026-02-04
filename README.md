# AImploy - Job Networking Platform

A polished, professional job networking platform built with Next.js 16, TypeScript, and Tailwind CSS. AImploy connects job seekers with recruiters through a unified feed, real-time messaging, AI-powered insights, and opportunity discovery.

## Features

### Core Features
- **Unified Feed**: Posts, job listings, and company updates in one place
- **Real-time Messaging**: Direct messaging with threading and conversation persistence
- **Job Discovery**: Browse and apply to curated job listings with smart matching
- **Professional Profiles**: Showcase your experience, skills, and achievements
- **AI Agent (Ask AIM)**: Get personalized career advice and job recommendations
- **Company Directory**: Explore companies and discover opportunities
- **Events & Networking**: Attend events and join professional groups
- **Notifications**: Stay updated with job alerts, messages, and connections

### Authentication
- Email/Password authentication
- OAuth integration (GitHub, LinkedIn)
- Session management

### User Roles
- **Job Seekers**: Search jobs, apply, get AI recommendations
- **Recruiters**: Post opportunities, review applications, connect with candidates

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks + SWR (recommended)

### Design System
- **Color Palette**: 
  - Primary: Deep Navy/Blue (#1A2F4A)
  - Accent: Teal/Cyan (#4DB8FF)
  - Secondary: Slate Blue (#5B7FB5)
  - Neutrals: Light grays to dark backgrounds with theme support
- **Typography**: Geist (sans) + Geist Mono
- **Spacing**: Tailwind 4 spacing scale
- **Border Radius**: 0.5rem (8px) default

## Project Structure

```
app/
├── (app)/                    # Protected app routes
│   ├── page.tsx             # Feed/Home
│   ├── jobs/page.tsx        # Job listings
│   ├── messages/page.tsx    # Messaging interface
│   ├── agent/page.tsx       # AI Agent chat
│   ├── profile/page.tsx     # User profile
│   ├── settings/page.tsx    # Settings
│   ├── companies/page.tsx   # Company directory
│   ├── events/page.tsx      # Events
│   ├── notifications/page.tsx # Notifications
│   ├── users/page.tsx       # User discovery
│   └── groups/page.tsx      # Groups/Communities
├── signin/page.tsx          # Sign in page
├── signup/page.tsx          # Sign up page
├── landing.tsx              # Landing page component
├── page.tsx                 # Homepage (shows landing)
├── layout.tsx               # Root layout
└── globals.css              # Global styles & theme

components/
├── app-sidebar.tsx          # Navigation sidebar
├── app-layout.tsx           # App wrapper with sidebar
├── header.tsx               # Top header bar
└── ui/                      # shadcn/ui components
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd aimploy
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Key Pages & Components

### Authentication
- **SignIn** (`/signin`): Email/password login with OAuth options
- **SignUp** (`/signup`): Account creation and onboarding

### Main App (Protected)
- **Home/Feed** (`/`): Social feed with posts and job highlights
- **Jobs** (`/jobs`): Job listings with filtering and application tracking
- **Messages** (`/messages`): Real-time messaging with conversations
- **AI Agent** (`/agent`): Chat with AI for career guidance
- **Profile** (`/profile`): User profile with experience and skills
- **Settings** (`/settings`): Account preferences and privacy

### Exploration
- **Companies** (`/companies`): Browse company profiles
- **Events** (`/events`): Networking events and webinars
- **Users** (`/users`): Professional directory
- **Groups** (`/groups`): Communities and discussion groups
- **Notifications** (`/notifications`): Activity and alerts

## Styling & Theme

The app uses a professional, cohesive design system:

- **Light Mode**: Clean white backgrounds with dark text
- **Dark Mode**: Deep navy backgrounds with light text
- **Color-coded Components**: 
  - Primary (Blue) for main actions and CTAs
  - Accent (Teal) for highlights and interactive elements
  - Secondary (Slate) for alternative actions
  - Destructive (Red) for delete/logout

## Component Architecture

### App Layout Structure
```
<SidebarProvider>
  <AppSidebar />        # Navigation (collapsible on mobile)
  <Header />            # Search bar and notifications
  <main>                # Page content
</SidebarProvider>
```

### Sidebar Navigation
- Main: Home, Jobs, Messages, Notifications
- Explore: Users, Companies, Events, Groups
- Secondary: Settings, Search

## Next Steps - Backend Integration

To complete the full-stack implementation:

1. **Database**: Set up Supabase/Neon PostgreSQL with tables for:
   - Users & profiles
   - Posts & comments
   - Jobs & applications
   - Messages & conversations
   - Connections/followers

2. **Authentication**: Implement auth with:
   - Supabase Auth or custom JWT
   - Session management
   - OAuth providers

3. **API**: Build FastAPI/Node.js backend with:
   - REST endpoints for all features
   - WebSocket for real-time messaging
   - AI agent endpoints (RAG + LLM integration)

4. **ATS Integration**: Connect to Ashby/Greenhouse APIs for:
   - Job synchronization
   - Application tracking
   - Candidate data

5. **Real-time Features**: Implement with:
   - Supabase Realtime or Socket.io
   - Message delivery and read receipts
   - Live notifications

## Best Practices

- **Performance**: Uses Next.js App Router with code splitting
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Responsive**: Mobile-first design, works on all devices
- **Theme Support**: Dark/light mode with CSS variables
- **Type Safety**: Full TypeScript coverage
- **Component Reusability**: shadcn/ui components + custom wrappers

## Deployment

Deploy to Vercel with one click:

```bash
npm install -g vercel
vercel
```

Or use GitHub Actions for CI/CD.

## License

MIT
