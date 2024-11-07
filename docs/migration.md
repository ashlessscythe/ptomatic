# Migration

## Data Preparation

- Map data fields from the old app to `pto-matic` equivalents (e.g., name, email, PTO balance).

## Steps for Migration

1. **Export Data** from the previous app.
2. **Data Cleaning**: Ensure the data is formatted to match `pto-matic` schema.
3. **Import Process**:
   - Use Prisma scripts to migrate data into Neon.tech.
   - Assign Clerk user accounts based on existing emails.

## Post-Migration Checks

- Verify user data accuracy.
- Ensure PTO balances and historical requests are imported correctly.
