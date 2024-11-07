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
import { PTORequest } from "@prisma/client";
import { useState } from "react";
import { cancelPTORequest } from "../actions";

interface PTORequestListProps {
  requests: PTORequest[];
  userId: string;
}

export function PTORequestList({ requests, userId }: PTORequestListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleCancel = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this request?")) {
      return;
    }

    setCancelingId(requestId);
    try {
      const result = await cancelPTORequest(requestId, userId);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error canceling request:", error);
      alert("Failed to cancel request");
    } finally {
      setCancelingId(null);
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
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
              <TableCell>
                {request.status === "PENDING" && (
                  <Button
                    onClick={() => handleCancel(request.id)}
                    variant="destructive"
                    size="sm"
                    disabled={cancelingId === request.id}
                  >
                    {cancelingId === request.id ? "Canceling..." : "Cancel"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-neutral-500">
                No PTO requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
