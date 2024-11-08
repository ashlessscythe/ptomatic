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
import { formatDate } from "@/lib/utils";
import type { PTORequest } from "@prisma/client";

interface PTORequestListProps {
  requests: PTORequest[];
}

export function PTORequestList({ requests }: PTORequestListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My PTO Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No PTO requests found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDate(request.startDate)}</TableCell>
                  <TableCell>{formatDate(request.endDate)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        request.status === "APPROVED"
                          ? "text-green-600"
                          : request.status === "DENIED"
                          ? "text-red-600"
                          : "text-blue-600"
                      }
                    >
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>{request.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
