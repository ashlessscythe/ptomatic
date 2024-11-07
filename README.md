# PTO-matic

A modern PTO (Paid Time Off) management system built with Next.js, featuring SSO authentication, role-based access control, and automated workflows.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: ShadCN UI (Tailwind CSS)
- **Authentication**: Clerk.dev with SSO support
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Email**: Resend with React email templates
- **Deployment**: Vercel

## Features

- **SSO Authentication**:

  - Secure login via Google and other providers
  - Role synchronization with Clerk organizations
  - Pending approval state for new users

- **Role-Based Access**:

  - Support for Users, Managers, Approvers, and Admins
  - Automatic role sync with Clerk organization roles

- **PTO Management**:

  - Request submission and tracking
  - Balance management
  - Approval workflows
  - Business day calculations

- **Department Management**:

  - Organize users and approvers by department
  - Department-specific approval flows

- **Email Notifications**:
  - React-based email templates
  - Notifications for:
    - PTO request submissions
    - Status updates
    - Account approvals

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn
- PostgreSQL database (we use Neon.tech)
- Clerk.dev account
- Resend account for email notifications

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   DATABASE_URL=your_neon_db_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   RESEND_API_KEY=your_resend_api_key
   ```

### Clerk Webhook Setup

1. Go to your Clerk Dashboard
2. Navigate to Webhooks
3. Add a new webhook endpoint: `your_domain/api/webhooks/clerk`
4. Copy the signing secret to your .env file as CLERK_WEBHOOK_SECRET
5. Enable the following events:
   - user.created
   - user.updated
   - user.deleted
   - organizationMembership.created
   - organizationMembership.updated

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Project Structure

```
src/
├── app/             # Next.js app router pages
│   ├── admin/       # Admin dashboard
│   ├── api/         # API routes
│   └── dashboard/   # User dashboard
├── components/      # Reusable UI components
├── lib/            # Utility functions
└── prisma/         # Database schema and migrations
```

## Development Status

The project is being developed in phases (tollgates):

1. ✅ Initial Setup & Basic Authentication
2. ✅ User & Admin Workflows
3. 🚧 Manager & Approver Roles
4. 📅 Notifications & Reporting
5. 📅 Migration & Testing
6. 📅 Production Release

See `TODO.txt` for detailed development progress.

## License

MIT
