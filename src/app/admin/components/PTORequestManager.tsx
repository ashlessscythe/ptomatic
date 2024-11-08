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
import { formatDate } from "@/lib/utils";
import { updateRequestStatus } from "../actions";
import { useState } from "react";
import type { PTORequest, User } from "@prisma/client";

type RequestWithUser = PTORequest & {
  user: User;
};

interface PTORequestManagerProps {
  requests: RequestWithUser[];
}

export function PTORequestManager({ requests }: PTORequestManagerProps) {
  const [updating, setUpdating] = useState<string | null>(null);

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

  const pendingRequests = requests.filter(
    (request) => request.status === "PENDING"
  );
  const otherRequests = requests.filter(
    (request) => request.status !== "PENDING"
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Pending PTO Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No pending requests
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.user.name}</TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusUpdate(request.id, "APPROVED")
                        }
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

      <Card>
        <CardHeader>
          <CardTitle>Past PTO Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {otherRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No past requests
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.user.name}</TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          request.status === "APPROVED"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {request.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
