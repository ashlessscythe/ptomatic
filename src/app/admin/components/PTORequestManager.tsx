"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PTORequest, User, Department } from "@prisma/client";
import { useState } from "react";
import { updatePTORequestStatus } from "@/app/dashboard/actions";

type PTORequestWithUser = PTORequest & {
  user: User & {
    department: Department | null;
  };
};

interface PTORequestManagerProps {
  requests: PTORequestWithUser[];
}

export function PTORequestManager({ requests }: PTORequestManagerProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (
    requestId: string,
    status: "APPROVED" | "DENIED"
  ) => {
    setUpdatingId(requestId);
    try {
      const result = await updatePTORequestStatus(requestId, status);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "DENIED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const pendingRequests = requests.filter((req) => req.status === "PENDING");
  const otherRequests = requests.filter((req) => req.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Pending Requests</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.user.name}</TableCell>
                  <TableCell>
                    {request.user.department?.name || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    {new Date(request.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(request.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{request.notes || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          handleStatusUpdate(request.id, "APPROVED")
                        }
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100 text-green-700"
                        disabled={updatingId === request.id}
                      >
                        {updatingId === request.id ? "Updating..." : "Approve"}
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(request.id, "DENIED")}
                        variant="outline"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 text-red-700"
                        disabled={updatingId === request.id}
                      >
                        {updatingId === request.id ? "Updating..." : "Deny"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendingRequests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-neutral-500"
                  >
                    No pending requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Request History</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.user.name}</TableCell>
                  <TableCell>
                    {request.user.department?.name || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    {new Date(request.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(request.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>{request.notes || "-"}</TableCell>
                </TableRow>
              ))}
              {otherRequests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-neutral-500"
                  >
                    No request history
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
