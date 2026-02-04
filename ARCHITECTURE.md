# AImploy Architecture & Flow Diagrams

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Next.js 16 Frontend (This Project)            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │              React Components (TSX)                 │ │   │
│  │  │  - Pages (14 main routes)                          │ │   │
│  │  │  - UI Components (shadcn/ui)                       │ │   │
│  │  │  - Layout (Sidebar + Header)                       │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │         Styling & Design System                     │ │   │
│  │  │  - Tailwind CSS v4                                 │ │   │
│  │  │  - CSS Variables (theme tokens)                    │ │   │
│  │  │  - Dark/Light mode support                         │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓ API Calls ↓                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────────┐
        │      FastAPI / Node.js Backend             │
        │   (To be implemented by backend team)      │
        └────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────────┐
        │      PostgreSQL Database                   │
        │   (Supabase / Neon / PlanetScale)         │
        └────────────────────────────────────────────┘
\`\`\`

## Page Hierarchy & Routes

\`\`\`
PUBLIC ROUTES
│
├─ / (Landing Page)
│  ├─ Hero Section
│  ├─ Features Grid
│  ├─ CTA Section
│  └─ Footer
│
├─ /signin (Sign In)
│  ├─ Email/Password Form
│  ├─ Forgot Password Link
│  └─ OAuth Buttons
│
└─ /signup (Sign Up)
   ├─ Registration Form
   ├─ Email Verification
   └─ Initial Profile Setup

PROTECTED ROUTES (/(app))
│
├─ / (Home/Feed)
│  ├─ Post Composer
│  ├─ Posts Feed
│  └─ Sidebar (Right - optional)
│
├─ /jobs
│  ├─ Job Listing Cards
│  ├─ Filter Panel
│  ├─ Job Details
│  └─ Application Modal
│
├─ /messages
│  ├─ Conversations List
│  ├─ Chat Interface
│  ├─ Message Composer
│  └─ Attachment Support
│
├─ /agent (AI Assistant)
│  ├─ Chat History Sidebar
│  ├─ Message Interface
│  ├─ Conversation Threading
│  └─ Response Streaming
│
├─ /profile
│  ├─ Profile Header
│  ├─ Skills Section
│  ├─ Experience Timeline
│  └─ Posts Section
│
├─ /settings
│  ├─ Profile Tab
│  ├─ Notifications Tab
│  ├─ Privacy Tab
│  └─ Appearance Tab
│
├─ /companies
│  ├─ Company Grid
│  ├─ Company Cards
│  └─ Follow Actions
│
├─ /events
│  ├─ Event Listings
│  ├─ Event Details
│  ├─ Speaker Info
│  └─ RSVP Actions
│
├─ /users
│  ├─ User Discovery Grid
│  ├─ User Cards
│  ├─ Connect Button
│  └─ Message Button
│
├─ /groups
│  ├─ Group Listings
│  ├─ Group Cards
│  ├─ Members Count
│  └─ Join/Leave Actions
│
└─ /notifications
   ├─ Notification List
   ├─ Notification Types
   ├─ Action Buttons
   └─ Mark as Read
\`\`\`

## Component Architecture

\`\`\`
App Root
├── Public Routes
│   ├── Landing Page
│   ├── SignIn Page
│   └── SignUp Page
│
└── Protected Routes (/(app)/layout.tsx)
    └── SidebarProvider
        ├── AppSidebar Component
        │   ├── Logo
        │   ├── Main Navigation
        │   │   ├── Home
        │   │   ├── Jobs
        │   │   ├── Messages
        │   │   └── Notifications
        │   ├── AI Agent Link
        │   ├── Explore Section
        │   │   ├── Users
        │   │   ├── Companies
        │   │   ├── Events
        │   │   └── Groups
        │   └── Footer
        │       ├── User Profile
        │       └── Logout
        │
        ├── Header Component
        │   ├── Search Input
        │   ├── Mobile Trigger
        │   └── Notifications Bell
        │
        └── Main Content
            ├── Feed
            ├── Jobs
            ├── Messages
            ├── Agent
            ├── Profile
            ├── Settings
            ├── Companies
            ├── Events
            ├── Users
            ├── Groups
            └── Notifications
\`\`\`

## Data Flow

\`\`\`
User Action
    ↓
React Component (Client)
    ↓
State Update / User Interaction
    ↓
API Call (lib/api.ts)
    ↓
Backend API (to be implemented)
    ↓
Database Query
    ↓
Response Data
    ↓
Update Component State
    ↓
Re-render Component
    ↓
Display to User
\`\`\`

## Authentication Flow

\`\`\`
Landing Page
    ↓
User clicks "Sign In" or "Get Started"
    ↓
    ├─→ SignIn Page (/signin)
    │   ├─ Email/Password Form
    │   ├─ OAuth Options
    │   └─ Submit → API /auth/signin
    │       ↓
    │   Backend Auth
    │       ↓
    │   Store Token (localStorage/cookies)
    │       ↓
    │   Redirect to /
    │
    └─→ SignUp Page (/signup)
        ├─ Registration Form
        ├─ OAuth Options
        └─ Submit → API /auth/signup
            ↓
        Backend Registration
            ↓
        Auto Sign In
            ↓
        Redirect to / (with onboarding)
\`\`\`

## Messaging Flow

\`\`\`
User Opens Messaging Page
    ↓
Fetch Conversations List
    ↓
Display Conversation List
    ↓
User Selects Conversation
    ↓
Fetch Messages for Conversation
    ↓
Display Chat Interface
    ↓
User Types & Sends Message
    ↓
Optimistic UI Update (show message immediately)
    ↓
API POST /messages
    ↓
Backend Stores Message
    ↓
WebSocket broadcasts to recipient
    ↓
Recipient receives in real-time
    ↓
Both parties see updated read status
\`\`\`

## Job Application Flow

\`\`\`
User Browses Jobs (/jobs)
    ↓
Filters/Searches for roles
    ↓
Views Job Details
    ↓
Clicks "View & Apply"
    ↓
Application Modal Opens
    ├─ Shows job details
    ├─ User selects resume
    └─ Optional cover letter
    ↓
Submit Application
    ↓
API POST /applications
    ↓
Backend stores application
    ↓
Updates user's "Applied Jobs"
    ↓
Notification sent to recruiter
    ↓
User sees confirmation
    ↓
Can view status in /jobs/applied
\`\`\`

## Real-time Features (Backend Implementation)

\`\`\`
Message Sent
    ↓
WebSocket Event Emitted
    ↓
Backend receives event
    ↓
Stores in database
    ↓
Broadcasts to subscribers
    ↓
Frontend listeners receive update
    ↓
UI updates instantly (no refresh needed)

Same pattern for:
- New notifications
- Message read receipts
- Typing indicators
- Job application status updates
- New connections
- Post reactions
\`\`\`

## File Organization Overview

\`\`\`
aimploy/
│
├── app/
│   ├── (app)/                           # Protected routes
│   │   ├── layout.tsx                   # App wrapper with sidebar
│   │   ├── page.tsx                     # Home/Feed
│   │   ├── jobs/
│   │   │   ├── page.tsx                 # Jobs listing
│   │   │   └── [id]/page.tsx            # Job detail (future)
│   │   ├── messages/
│   │   │   ├── page.tsx                 # Messages interface
│   │   │   └── [id]/page.tsx            # Conversation (future)
│   │   ├── agent/
│   │   │   └── page.tsx                 # AI Agent chat
│   │   ├── profile/
│   │   │   ├── page.tsx                 # User profile
│   │   │   └── [id]/page.tsx            # Other profiles (future)
│   │   ├── settings/
│   │   │   └── page.tsx                 # Account settings
│   │   ├── companies/
│   │   │   ├── page.tsx                 # Company directory
│   │   │   └── [id]/page.tsx            # Company detail (future)
│   │   ├── events/
│   │   │   ├── page.tsx                 # Events listing
│   │   │   └── [id]/page.tsx            # Event detail (future)
│   │   ├── users/
│   │   │   └── page.tsx                 # User discovery
│   │   ├── groups/
│   │   │   ├── page.tsx                 # Groups listing
│   │   │   └── [id]/page.tsx            # Group detail (future)
│   │   └── notifications/
│   │       └── page.tsx                 # Notifications
│   │
│   ├── signin/
│   │   └── page.tsx                     # Sign in page
│   ├── signup/
│   │   └── page.tsx                     # Sign up page
│   ├── landing.tsx                      # Landing page component
│   ├── page.tsx                         # Home route (shows landing/feed)
│   ├── layout.tsx                       # Root layout
│   └── globals.css                      # Global styles + theme
│
├── components/
│   ├── app-sidebar.tsx                  # Navigation sidebar
│   ├── app-layout.tsx                   # App layout wrapper
│   ├── header.tsx                       # Top header bar
│   └── ui/                              # 40+ shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       └── ... (many more)
│
├── lib/
│   ├── utils.ts                         # Utility functions (cn)
│   ├── api.ts                           # API helpers
│   └── theme.ts                         # Theme utilities
│
├── types/
│   └── index.ts                         # TypeScript type definitions
│
├── public/                              # Static assets
│   ├── icon.svg
│   ├── icon-light-32x32.png
│   └── icon-dark-32x32.png
│
├── README.md                            # Project overview
├── SETUP.md                             # Setup & implementation guide
├── IMPLEMENTATION_SUMMARY.md            # This summary
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.ts                   # Tailwind configuration
\`\`\`

## Technology Stack Visualization

\`\`\`
┌──────────────────────────────────────────────────────────┐
│                    Frontend Framework                      │
│                      Next.js 16                           │
├──────────────────────────────────────────────────────────┤
│  React 19.2 + TypeScript 5 + Tailwind CSS v4             │
├──────────────────────────────────────────────────────────┤
│  UI Components: shadcn/ui (40+)                          │
│  Icons: Lucide React                                     │
│  State: React Hooks (SWR-ready)                          │
├──────────────────────────────────────────────────────────┤
│  APIs: Fetch API (abstracted in lib/api.ts)             │
│  Auth: JWT / Cookies (to be implemented)                │
│  Real-time: WebSocket-ready (to be implemented)         │
├──────────────────────────────────────────────────────────┤
│  Deployment: Vercel / Self-hosted                        │
│  Build: ESBuild + Turbopack (Next.js 16)                │
│  Quality: TypeScript + Prettier + Tailwind CSS           │
└──────────────────────────────────────────────────────────┘
\`\`\`

## Performance Optimization Strategy

\`\`\`
Image Optimization
├─ Next.js Image component
├─ Automatic WebP conversion
└─ Lazy loading

Code Splitting
├─ Route-based splitting
├─ Component lazy loading
└─ Dynamic imports

Caching Strategy
├─ Browser cache
├─ API response cache (lib/api.ts)
├─ Static generation where applicable
└─ ISR for dynamic content

Rendering
├─ Server Components (RSC) for layouts
├─ Client Components for interactions
└─ Streaming for large content
\`\`\`

---

This architecture provides a scalable, maintainable foundation for the AImploy platform. The frontend is production-ready and designed to integrate seamlessly with the backend once implemented.
