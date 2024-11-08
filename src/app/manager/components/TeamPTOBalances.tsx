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
import type { User, PTORequest } from "@prisma/client";

type ManagedUser = User & {
  ptoRequests: PTORequest[];
  department?: { name: string } | null;
};

interface TeamPTOBalancesProps {
  managedUsers: ManagedUser[];
  isAdmin: boolean;
}

export default function TeamPTOBalances({
  managedUsers,
  isAdmin,
}: TeamPTOBalancesProps) {
  const calculateUsedPTO = (user: ManagedUser) => {
    return user.ptoRequests
      .filter((request) => request.status === "APPROVED")
      .reduce((total, request) => {
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        const days =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;
        return total + days;
      }, 0);
  };

  // Group users by department if admin
  const groupedUsers = isAdmin
    ? managedUsers.reduce((acc, user) => {
        const deptName = user.department?.name || "No Department";
        if (!acc[deptName]) {
          acc[deptName] = [];
        }
        acc[deptName].push(user);
        return acc;
      }, {} as Record<string, ManagedUser[]>)
    : { Team: managedUsers };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAdmin ? "All Teams PTO Balances" : "Team PTO Balances"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Department</TableHead>}
              <TableHead>Employee</TableHead>
              <TableHead>Total Balance</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Remaining</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedUsers).map(([deptName, users]) =>
              users.map((user) => {
                const usedDays = calculateUsedPTO(user);
                const remainingDays = user.ptoBalance - usedDays;

                return (
                  <TableRow key={user.id}>
                    {isAdmin && <TableCell>{deptName}</TableCell>}
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.ptoBalance} days</TableCell>
                    <TableCell>{usedDays} days</TableCell>
                    <TableCell>
                      <span className={remainingDays < 5 ? "text-red-500" : ""}>
                        {remainingDays} days
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
