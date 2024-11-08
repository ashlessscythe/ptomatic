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
import { Button } from "@/components/ui/button";
import { updateRequestStatus } from "../actions";
import { useState } from "react";
import type { User, PTORequest } from "@prisma/client";

type ManagedUser = User & {
  ptoRequests: PTORequest[];
  department?: { name: string } | null;
};

interface TeamPTORequestsProps {
  managedUsers: ManagedUser[];
  isAdmin: boolean;
}

export default function TeamPTORequests({
  managedUsers,
  isAdmin,
}: TeamPTORequestsProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const pendingRequests = managedUsers.flatMap((user) =>
    user.ptoRequests
      .filter((request) => request.status === "PENDING")
      .map((request) => ({
        ...request,
        userName: user.name,
        userEmail: user.email,
        departmentName: user.department?.name || "No Department",
      }))
  );

  const handleStatusUpdate = async (
    requestId: string,
    status: "APPROVED" | "DENIED"
  ) => {
    try {
      setUpdating(requestId);
      await updateRequestStatus(requestId, status);
    } catch (error) {
      console.error("Failed to update request status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAdmin ? "All Pending PTO Requests" : "Pending PTO Requests"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No pending PTO requests
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Department</TableHead>}
                <TableHead>Employee</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  {isAdmin && <TableCell>{request.departmentName}</TableCell>}
                  <TableCell>{request.userName}</TableCell>
                  <TableCell>{formatDate(request.startDate)}</TableCell>
                  <TableCell>{formatDate(request.endDate)}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(request.id, "APPROVED")}
                      disabled={updating === request.id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(request.id, "DENIED")}
                      disabled={updating === request.id}
                    >
                      Deny
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
