# PTO-matic

A modern PTO (Paid Time Off) management system built with Next.js, featuring SSO authentication, role-based access control, and automated workflows.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: ShadCN UI (Tailwind CSS)
- **Authentication**: Clerk.dev with SSO support
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Deployment**: TBD

## Features

- **SSO Authentication**: Secure login via Google and other providers
- **Role-Based Access**: Support for Users, Managers, Approvers, and Admins
- **PTO Management**:
  - Request submission and tracking
  - Balance management
  - Approval workflows
- **Department Management**: Organize users and approvers by department
- **Notifications**: Email notifications for key actions with resend capability
- **Reporting**: PTO usage trends and department insights

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn
- PostgreSQL database (we use Neon.tech)
- Clerk.dev account

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   DATABASE_URL=your_neon_db_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret_key
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
├── components/      # Reusable UI components
├── lib/            # Utility functions and shared logic
└── prisma/         # Database schema and migrations
```

## Development Status

The project is being developed in phases (tollgates):

1. ✅ Initial Setup & Basic Authentication
2. 🚧 User & Admin Workflows
3. 📅 Manager & Approver Roles
4. 📅 Notifications & Reporting
5. 📅 Migration & Testing
6. 📅 Production Release

See `TODO.txt` for detailed development progress.

## License

MIT
