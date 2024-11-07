import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRow } from "./components/UserRow";
import { DepartmentRow } from "./components/DepartmentRow";
import { PTORequestManager } from "./components/PTORequestManager";
import { createDepartment, deleteDepartment } from "./actions";

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Get the user's role from our database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // If not an admin, redirect to home
  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  // Get all users and their departments
  const users = await prisma.user.findMany({
    include: {
      department: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get all departments
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  // Get all PTO requests with user and department info
  const ptoRequests = await prisma.pTORequest.findMany({
    include: {
      user: {
        include: {
          department: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingRequestsCount = ptoRequests.filter(
    (req) => req.status === "PENDING"
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-neutral-600">Total Users</p>
            <p className="text-2xl font-semibold">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-neutral-600">Departments</p>
            <p className="text-2xl font-semibold">{departments.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-neutral-600">Pending Requests</p>
            <p className="text-2xl font-semibold">{pendingRequestsCount}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">PTO Requests</h2>
          <PTORequestManager requests={ptoRequests} />
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>PTO Balance</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    departments={departments}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Departments</h2>
            <form
              action={async (formData: FormData) => {
                "use server";
                const name = formData.get("name");
                if (typeof name === "string" && name.trim()) {
                  await createDepartment(name.trim());
                }
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Department name"
                  className="px-2 py-1 border rounded"
                  required
                />
                <Button type="submit">Add Department</Button>
              </div>
            </form>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <DepartmentRow
                    key={department.id}
                    department={department}
                    userCount={
                      users.filter((u) => u.departmentId === department.id)
                        .length
                    }
                    onDelete={deleteDepartment}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
