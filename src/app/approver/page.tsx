import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DepartmentPTORequests from "./components/DepartmentPTORequests";
import DepartmentOverview from "./components/DepartmentOverview";
import type { Metadata } from "next";
import type { Session } from "next-auth";

export const metadata: Metadata = {
  title: "Department Approver Dashboard - PTO-matic",
  description: "Manage department PTO requests and view department statistics",
};

export default async function ApproverDashboard() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email },
    include: {
      approvedDepartments: {
        include: {
          users: {
            include: {
              ptoRequests: {
                orderBy: {
                  createdAt: "desc",
                },
              },
              manager: true,
            },
          },
        },
      },
    },
  });

  if (!user || (user.role !== "APPROVER" && user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  // If admin, get all departments
  let departments = user.approvedDepartments;
  if (user.role === "ADMIN") {
    const allDepartments = await prisma.department.findMany({
      include: {
        users: {
          include: {
            ptoRequests: {
              orderBy: {
                createdAt: "desc",
              },
            },
            manager: true,
          },
        },
      },
    });
    departments = allDepartments;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {user.role === "ADMIN"
          ? "All Departments Dashboard"
          : "Department Approver Dashboard"}
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        <DepartmentPTORequests
          departments={departments}
          isAdmin={user.role === "ADMIN"}
        />
        <DepartmentOverview
          departments={departments}
          isAdmin={user.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
