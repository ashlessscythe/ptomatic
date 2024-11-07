"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Department } from "@prisma/client";
import { useState } from "react";

interface DepartmentRowProps {
  department: Department;
  userCount: number;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function DepartmentRow({
  department,
  userCount,
  onDelete,
}: DepartmentRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <TableRow>
      <TableCell>{department.name}</TableCell>
      <TableCell>{userCount} users</TableCell>
      <TableCell>
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
