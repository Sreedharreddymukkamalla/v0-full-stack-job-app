## Mock Data & Demo Credentials Guide

AImploy includes built-in mock data so you can test the platform immediately without needing a backend server.

### Demo Credentials

Three pre-configured demo users are available on the Sign In page:

**1. Job Seeker**
- Email: `demo@example.com`
- Password: `demo123456`
- Role: Job Seeker
- Title: Full Stack Engineer at Tech Corp

**2. Recruiter**
- Email: `recruiter@example.com`
- Password: `recruiter123`
- Role: Recruiter
- Title: Senior Recruiter at Tech Talents Inc

**3. Hiring Manager**
- Email: `hiring@example.com`
- Password: `hiring123456`
- Role: Hiring Manager
- Title: Engineering Manager at Innovation Labs

### Quick Sign In

All demo credentials are displayed on the Sign In page. Simply click any user card to auto-fill the email and password, then click "Sign In".

### How Mock Data Works

The app supports two modes:

#### 1. Mock Mode (Development)
- **Automatically enabled** when no backend is available
- Uses local storage for user sessions
- Provides realistic dummy data for all features
- No API calls required
- Perfect for UI testing and demos

#### 2. Real API Mode
- **Enabled when backend is available**
- Connect your FastAPI/Node.js backend
- Configure `NEXT_PUBLIC_API_URL` environment variable
- Uses actual database for persistence

### Mock Data Included

- **Users**: 3 pre-configured users with different roles
- **Posts**: 3 sample feed posts with likes, comments, shares
- **Jobs**: 3 job listings with descriptions and requirements
- **Messages**: Conversation threads between users
- **Companies**: 2 sample company profiles
- **Notifications**: Activity notifications

### Using Mock Data

#### Option 1: Auto-Detection (Default)
The app automatically detects if a backend is available. If not found, it switches to mock mode.

#### Option 2: Force Mock Mode
Set this environment variable:
\`\`\`bash
NEXT_PUBLIC_USE_MOCK_DATA=true
\`\`\`

#### Option 3: Force Real API
Set your API URL:
\`\`\`bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
\`\`\`

### Local Storage Persistence

When using mock mode, user sessions are stored in browser's local storage:
- `aimploy_current_user` - Currently logged-in user data
- `aimploy_auth_token` - Session token
- `aimploy_use_mock_data` - Mock mode flag

### Auth Service

The `@/lib/auth.ts` module handles authentication:

\`\`\`typescript
import { signIn, getCurrentUser, signOut, isAuthenticated } from '@/lib/auth';

// Sign in with email and password
const user = signIn('demo@example.com', 'demo123456');

// Get current user
const user = getCurrentUser();

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Sign out
signOut();
\`\`\`

### API Helpers

The `@/lib/api.ts` module intelligently handles API calls:

\`\`\`typescript
import { apiFetch } from '@/lib/api';

// Fetches real data or mock data automatically
const posts = await apiFetch('/posts');
const jobs = await apiFetch('/jobs');
\`\`\`

### Transitioning to Real Backend

When your backend is ready:

1. Deploy your FastAPI/Node.js server
2. Set `NEXT_PUBLIC_API_URL` to your backend URL
3. Update authentication to use real login endpoint
4. Replace `apiFetch` calls with actual API contracts
5. Remove mock data dependencies

The app is designed to work seamlessly with both mock and real data, making development flexible and tests easy.

### Modifying Mock Data

To add or modify mock data:

1. Edit `/lib/mock-data.ts`
2. Update the `MOCK_*` arrays
3. Changes take effect immediately in development

Example:
\`\`\`typescript
export const MOCK_USERS = [
  {
    id: '1',
    email: 'custom@example.com',
    password: 'custompass',
    name: 'Your Name',
    // ... other fields
  },
];
\`\`\`

### Testing Tips

- Use the demo credentials to test different user roles
- Check how features behave with mock data
- Test error states and loading states
- Verify responsive design on different screen sizes
- Test dark/light theme switching
