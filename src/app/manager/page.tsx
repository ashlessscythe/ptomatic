import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeamPTORequests from "./components/TeamPTORequests";
import TeamPTOBalances from "./components/TeamPTOBalances";
import type { Metadata } from "next";
import type { Session } from "next-auth";
import React from "react";

export const metadata: Metadata = {
  title: "Team Dashboard - PTO-matic",
  description: "Manage team PTO requests and balances",
};

export default async function ManagerDashboard() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email },
    include: {
      managedUsers: {
        include: {
          ptoRequests: {
            orderBy: {
              createdAt: "desc",
            },
          },
          department: true,
        },
      },
    },
  });

  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  // If admin, get all users and their requests
  let allUsers = user.managedUsers;
  if (user.role === "ADMIN") {
    const allData = await prisma.user.findMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
      include: {
        ptoRequests: {
          orderBy: {
            createdAt: "desc",
          },
        },
        department: true,
        manager: true,
      },
    });
    allUsers = allData;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {user.role === "ADMIN" ? "All Teams Dashboard" : "Team Dashboard"}
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        <TeamPTORequests
          managedUsers={allUsers}
          isAdmin={user.role === "ADMIN"}
        />
        <TeamPTOBalances
          managedUsers={allUsers}
          isAdmin={user.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
