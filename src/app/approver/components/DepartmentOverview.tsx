"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Department, User, PTORequest } from "@prisma/client";

type DepartmentWithUsers = Department & {
  users: (User & {
    ptoRequests: PTORequest[];
    manager: User | null;
  })[];
};

interface DepartmentOverviewProps {
  departments: DepartmentWithUsers[];
  isAdmin: boolean;
}

export default function DepartmentOverview({
  departments,
  isAdmin,
}: DepartmentOverviewProps) {
  const calculateDepartmentStats = (department: DepartmentWithUsers) => {
    const stats = {
      totalEmployees: department.users.length,
      totalPTODays: 0,
      usedPTODays: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      deniedRequests: 0,
    };

    department.users.forEach((user) => {
      stats.totalPTODays += user.ptoBalance;

      user.ptoRequests.forEach((request) => {
        if (request.status === "APPROVED") {
          const start = new Date(request.startDate);
          const end = new Date(request.endDate);
          const days =
            Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
          stats.usedPTODays += days;
          stats.approvedRequests += 1;
        } else if (request.status === "PENDING") {
          stats.pendingRequests += 1;
        } else if (request.status === "DENIED") {
          stats.deniedRequests += 1;
        }
      });
    });

    return stats;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAdmin ? "All Departments Overview" : "Department Overview"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Total PTO</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Requests</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => {
              const stats = calculateDepartmentStats(dept);
              const remainingDays = stats.totalPTODays - stats.usedPTODays;

              return (
                <TableRow key={dept.id}>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{stats.totalEmployees}</TableCell>
                  <TableCell>{stats.totalPTODays} days</TableCell>
                  <TableCell>
                    <span
                      className={
                        remainingDays < stats.totalEmployees * 5
                          ? "text-amber-500"
                          : ""
                      }
                    >
                      {stats.usedPTODays} days
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="text-blue-500">
                        {stats.pendingRequests} pending
                      </span>
                      <span className="text-green-500">
                        {stats.approvedRequests} approved
                      </span>
                      <span className="text-red-500">
                        {stats.deniedRequests} denied
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
