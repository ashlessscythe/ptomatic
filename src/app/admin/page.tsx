import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DepartmentRow } from "./components/DepartmentRow";
import { UserRow } from "./components/UserRow";
import { PTORequestManager } from "./components/PTORequestManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddUserModal } from "./components/AddUserModal";
import type { Department, User } from "@prisma/client";

type UserBasicInfo = {
  id: string;
  name: string;
  email: string;
};

type DepartmentWithRelations = Department & {
  _count: { users: number };
  approver: UserBasicInfo | null;
  manager: UserBasicInfo | null;
  users: UserBasicInfo[];
};

type UserWithDepartment = User & {
  department: Department | null;
  ptoRequests: {
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
    notes: string | null;
  }[];
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get all users with their departments
  const users = await prisma.user.findMany({
    include: {
      department: true,
      ptoRequests: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get all departments with user count and current manager/approver
  const departments = (await prisma.department.findMany({
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  })) as DepartmentWithRelations[];

  // Get managers and approvers for department assignments
  const managers = await prisma.user.findMany({
    where: { role: "MANAGER" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const approvers = await prisma.user.findMany({
    where: { role: "APPROVER" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  // Get all PTO requests with user details
  const requests = await prisma.pTORequest.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Departments</CardTitle>
            <AddUserModal />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <DepartmentRow
                    key={department.id}
                    department={department}
                    userCount={department._count.users}
                    managers={managers}
                    approvers={approvers}
                    currentManager={department.manager}
                    currentApprover={department.approver}
                    onDelete={async (id) => {
                      "use server";
                      try {
                        await prisma.department.delete({ where: { id } });
                        return { success: true };
                      } catch (error) {
                        return {
                          success: false,
                          error: "Failed to delete department",
                        };
                      }
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>PTO Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user as UserWithDepartment}
                    departments={departments}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <PTORequestManager requests={requests} />
      </div>
    </div>
  );
}
