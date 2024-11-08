"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Department } from "@prisma/client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignDepartmentManager, assignDepartmentApprover } from "../actions";

type UserBasicInfo = {
  id: string;
  name: string;
  email: string;
};

interface DepartmentRowProps {
  department: Department & {
    _count: { users: number };
    approver: UserBasicInfo | null;
  };
  userCount: number;
  managers: UserBasicInfo[];
  approvers: UserBasicInfo[];
  currentManager: UserBasicInfo | null;
  currentApprover: UserBasicInfo | null;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function DepartmentRow({
  department,
  userCount,
  managers,
  approvers,
  currentManager,
  currentApprover,
  onDelete,
}: DepartmentRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this department?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await onDelete(department.id);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManagerChange = async (managerId: string) => {
    setIsUpdating(true);
    try {
      // Convert "none" to null before passing to the action
      const result = await assignDepartmentManager(
        department.id,
        managerId === "none" ? "" : managerId
      );
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error assigning manager:", error);
      alert("Failed to assign manager");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApproverChange = async (approverId: string) => {
    setIsUpdating(true);
    try {
      // Convert "none" to null before passing to the action
      const result = await assignDepartmentApprover(
        department.id,
        approverId === "none" ? "" : approverId
      );
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error assigning approver:", error);
      alert("Failed to assign approver");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <TableRow>
      <TableCell>{department.name}</TableCell>
      <TableCell>{userCount} users</TableCell>
      <TableCell>
        <Select
          value={currentManager?.id || "none"}
          onValueChange={handleManagerChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={currentApprover?.id || "none"}
          onValueChange={handleApproverChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select approver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {approvers.map((approver) => (
              <SelectItem key={approver.id} value={approver.id}>
                {approver.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          disabled={isDeleting || isUpdating}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
