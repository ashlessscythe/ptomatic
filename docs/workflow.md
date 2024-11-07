# Workflow

## User Workflow

1. **New User Registration**: Users sign up via Clerk SSO (or similar).

   - Upon signup, new users are directed to a pending page.
   - Admins assign new users to departments and managers as part of the onboarding.

2. **Requesting Time Off**:

   - Users submit time-off requests, which are reviewed by their assigned department approver.
   - Managers have visibility into their team’s PTO requests and balances for planning purposes.

3. **Approval Workflow**:
   - Department Approvers receive notifications for new PTO requests within their department.
   - Managers can view the PTO status of their direct reports but may not have direct approval permissions.

## Admin Workflow

- **User Management**: Admins assign new users to managers and departments and update roles as needed.
- **PTO Requests**: Admins can approve/deny requests across departments, while approvers focus on their assigned departments.
