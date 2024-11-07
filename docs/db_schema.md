# Database Schema

## Core Tables

### Users

| Field         | Type     | Description                             |
| ------------- | -------- | --------------------------------------- |
| id            | UUID     | Primary identifier for each user        |
| email         | String   | User’s email address                    |
| name          | String   | Full name                               |
| role          | Enum     | Role (e.g., `USER`, `ADMIN`, `MANAGER`) |
| pto_balance   | Integer  | Current PTO balance in hours            |
| department_id | UUID     | Foreign key linking to Departments      |
| manager_id    | UUID     | Foreign key linking to their Manager    |
| created_at    | DateTime | Timestamp of user creation              |

### Departments

| Field       | Type     | Description                             |
| ----------- | -------- | --------------------------------------- |
| id          | UUID     | Primary identifier for each department  |
| name        | String   | Name of the department                  |
| approver_id | UUID     | Foreign key linking to Approver (Admin) |
| created_at  | DateTime | Timestamp of department creation        |

### PTO Requests

| Field      | Type     | Description                                            |
| ---------- | -------- | ------------------------------------------------------ |
| id         | UUID     | Primary identifier for each request                    |
| user_id    | UUID     | Foreign key linking to Users                           |
| start_date | DateTime | Start date of PTO                                      |
| end_date   | DateTime | End date of PTO                                        |
| status     | Enum     | Request status (e.g., `PENDING`, `APPROVED`, `DENIED`) |
| notes      | String   | Optional notes from user or admin                      |
| created_at | DateTime | Timestamp of request creation                          |

### Audit Logs

| Field     | Type     | Description                               |
| --------- | -------- | ----------------------------------------- |
| id        | UUID     | Primary identifier for each log entry     |
| user_id   | UUID     | Foreign key linking to Users              |
| action    | String   | Action description (e.g., "Approved PTO") |
| timestamp | DateTime | Timestamp of action                       |

## Relationships

- **User → PTO Requests**: One-to-Many relationship for each user's PTO requests.
- **User → Department**: Many-to-One, allowing users to be associated with a department.
- **Manager → Users**: One-to-Many relationship where a manager oversees multiple users.
- **Approver (Admin) → Department**: Many-to-One, where a department is assigned an approver who handles PTO requests.
- **Admin Actions**: Admin actions are logged in `Audit Logs` for traceability.
