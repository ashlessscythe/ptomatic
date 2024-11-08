# Authentication

## NextAuth Setup

The application uses NextAuth.js for authentication with email/password credentials.

### Configuration

- NextAuth is configured in `src/app/api/auth/[...nextauth]/route.ts`
- Protected routes are handled by middleware in `src/middleware.ts`
- Sign-in page is located at `/auth/signin`

### User Authentication Flow

1. **New User Registration**:

   - Admin creates user accounts with email/password
   - Users can then sign in with their credentials

2. **Sign In Process**:
   - Users enter email and password
   - Credentials are verified against the database
   - Upon successful authentication, users are redirected to dashboard

### Roles and Permissions

- User roles are defined in the database schema:
  - USER: Regular employee
  - ADMIN: Full system access
  - MANAGER: Team management access
  - APPROVER: Department PTO approval access

### Protected Routes

- `/dashboard/*`: Requires authentication
- `/admin/*`: Requires admin role
- Public routes: Homepage and sign-in page

### Session Management

- JWT strategy is used for session management
- Sessions include user role for authorization
- Session data is accessible throughout the application

### Security Features

- Passwords are hashed using bcrypt
- JWT tokens for secure session management
- Protected API routes with role-based access
