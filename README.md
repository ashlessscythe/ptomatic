# PTO-matic

A modern PTO (Paid Time Off) management system built with Next.js, featuring SSO authentication, role-based access control, and automated workflows.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: ShadCN UI (Tailwind CSS)
- **Authentication**: NextAuth
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Email**: Resend with React email templates
- **Deployment**: Vercel

## Features

- **auth stuff goes here**

- **Role-Based Access**:

  - Support for Users, Managers, Approvers, and Admins

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
- Resend account for email notifications

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   DATABASE_URL=your_neon_db_url
   RESEND_API_KEY=your_resend_api_key
   AUTH_SECRET=supersecretstring
   ```

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
