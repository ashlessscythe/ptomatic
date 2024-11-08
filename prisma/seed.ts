const {
  PrismaClient,
  Role,
  UserStatus,
  RequestStatus,
} = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const prisma = new PrismaClient();

// Parse command line arguments
const args = yargs(hideBin(process.argv))
  .options({
    users: {
      alias: "u",
      type: "number",
      description: "Number of users to create per role",
      default: 3,
    },
    leaves: {
      alias: "l",
      type: "number",
      description: "Number of PTO requests per user",
      default: 5,
    },
    departments: {
      alias: "d",
      type: "number",
      description: "Number of departments to create",
      default: 3,
    },
    balance: {
      alias: "b",
      type: "number",
      description: "Default PTO balance for users",
      default: 20,
    },
    clear: {
      alias: "c",
      type: "boolean",
      description: "Clear existing data before seeding",
      default: false,
    },
    "default-password": {
      alias: "p",
      type: "string",
      description: "Default password for all users (except bob)",
      default: "",
    },
  })
  .parseSync();

// Set a fixed seed for faker to ensure consistent data generation
faker.seed(123);

const DEPARTMENT_NAMES = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
  "Product",
  "Legal",
  "Research",
];

const PTO_REASONS = [
  "Taking a vacation",
  "Family event",
  "Personal time",
  "Doctor appointment",
  "Home repairs",
  "Wedding anniversary",
  "Children's school event",
  "Moving day",
  "Volunteering",
  "Conference attendance",
];

function generatePredictableEmail(role: string, index: number): string {
  return `${role.toLowerCase()}${index + 1}@company.test`;
}

function getRolePassword(role: string): string {
  return `${role.toLowerCase()}pass123`;
}

function generateUTCDate(futureDate: Date): Date {
  // Convert to UTC midnight
  return new Date(
    Date.UTC(
      futureDate.getUTCFullYear(),
      futureDate.getUTCMonth(),
      futureDate.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

async function main() {
  // Only clear data if --clear flag is provided
  if (args.clear) {
    await prisma.pTORequest.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();
    console.log("🧹 Cleaned existing data");
  }

  // Create default user (bob) if doesn't exist
  const existingBob = await prisma.user.findUnique({
    where: { email: "bob@bob.bob" },
  });

  let bob;
  if (!existingBob) {
    const hashedPassword = await bcrypt.hash("bob", 10);
    bob = await prisma.user.create({
      data: {
        email: "bob@bob.bob",
        name: "Bob the Admin",
        password: hashedPassword,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        ptoBalance: args.balance,
      },
    });
    console.log(
      "👤 Created default admin user (bob@bob.bob) with password: bob"
    );
  } else {
    bob = existingBob;
    console.log("👤 Default admin user already exists");
  }

  // Create departments
  const departments = await Promise.all(
    Array.from(
      { length: Math.min(args.departments, DEPARTMENT_NAMES.length) },
      async (_, i) => {
        const deptName = DEPARTMENT_NAMES[i];
        const existingDept = await prisma.department.findFirst({
          where: { name: deptName },
        });

        if (!existingDept) {
          return prisma.department.create({
            data: { name: deptName },
          });
        }
        return existingDept;
      }
    )
  );

  console.log(`🏢 Created/Found ${departments.length} departments`);

  // Create users for each role
  const roles = [Role.USER, Role.MANAGER, Role.APPROVER];
  const users = [];
  const createdUsers = new Map<string, string>(); // Map to store role -> password for logging

  for (const role of roles) {
    for (let i = 0; i < args.users; i++) {
      const email = generatePredictableEmail(role, i);
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        const password = args["default-password"] || getRolePassword(role);
        const hashedPassword = await bcrypt.hash(password, 10);
        const departmentIndex = i % departments.length;
        // Generate a random value for ptoBalance between 1/2 of balance and 2 * balance
        const ptoBalance =
          Math.random() * (args.balance * 2 - args.balance / 2) +
          args.balance / 2;

        const user = await prisma.user.create({
          data: {
            email,
            name: faker.person.fullName(),
            password: hashedPassword,
            role: role,
            status: UserStatus.ACTIVE,
            ptoBalance: ptoBalance,
            departmentId: departments[departmentIndex].id,
          },
        });
        users.push(user);
        createdUsers.set(role, password);
      }
    }
  }

  console.log(`👥 Created ${users.length} new users`);
  if (users.length > 0) {
    console.log("\nNew users can login with:");
    for (const [role, password] of createdUsers.entries()) {
      const email = generatePredictableEmail(role, 0);
      console.log(`${role}: ${email} / ${password}`);
    }
  }

  // Assign managers to users without managers
  const managers = await prisma.user.findMany({
    where: { role: Role.MANAGER },
  });

  const usersWithoutManager = await prisma.user.findMany({
    where: {
      role: Role.USER,
      managerId: null,
    },
  });

  for (let i = 0; i < usersWithoutManager.length; i++) {
    const managerIndex = i % managers.length;
    await prisma.user.update({
      where: { id: usersWithoutManager[i].id },
      data: {
        managerId: managers[managerIndex].id,
      },
    });
  }

  console.log("👔 Assigned managers to users without managers");

  // Assign approvers to departments without approvers
  const approvers = await prisma.user.findMany({
    where: { role: Role.APPROVER },
  });

  const deptsWithoutApprover = await prisma.department.findMany({
    where: { approverId: null },
  });

  for (let i = 0; i < deptsWithoutApprover.length; i++) {
    const approverIndex = i % approvers.length;
    await prisma.department.update({
      where: { id: deptsWithoutApprover[i].id },
      data: {
        approverId: approvers[approverIndex].id,
      },
    });
  }

  console.log("✅ Assigned approvers to departments without approvers");

  // Create PTO requests for all users
  const allUsers = [...users, bob];
  const statuses = [
    RequestStatus.PENDING,
    RequestStatus.APPROVED,
    RequestStatus.DENIED,
  ];
  let requestCount = 0;

  for (const user of allUsers) {
    const userSeed = parseInt(user.id.replace(/\D/g, "").slice(0, 5) || "0");
    faker.seed(userSeed); // Set seed based on user ID for consistent requests

    for (let i = 0; i < args.leaves; i++) {
      const startDate = generateUTCDate(faker.date.future({ years: 1 }));
      const endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + (i % 3) + 1); // 1-3 days based on request index

      await prisma.pTORequest.create({
        data: {
          userId: user.id,
          startDate,
          endDate,
          status: statuses[i % statuses.length], // Cycle through statuses
          notes: PTO_REASONS[i % PTO_REASONS.length], // Cycle through reasons
        },
      });
      requestCount++;
    }
  }

  console.log(`📅 Created ${requestCount} new PTO requests`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
