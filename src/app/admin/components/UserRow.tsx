"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Department, Role, User } from "@prisma/client";
import { useState } from "react";
import {
  assignRole,
  assignDepartment,
  updatePTOBalance,
  deleteUser,
} from "../actions";

interface UserRowProps {
  user: User & {
    department: Department | null;
  };
  departments: Department[];
}

export function UserRow({ user, departments }: UserRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ptoBalance, setPTOBalance] = useState(user.ptoBalance.toString());

  const roles: Role[] = ["USER", "MANAGER", "APPROVER", "ADMIN"];

  const handleRoleChange = async (role: Role) => {
    setIsUpdating(true);
    try {
      const result = await assignRole(user.id, role);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDepartmentChange = async (departmentId: string) => {
    setIsUpdating(true);
    if (departmentId == "none") {
      alert("No Department Selected, no change made");
      setIsUpdating(false);
      return;
    }
    try {
      const result = await assignDepartment(user.id, departmentId);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating department:", error);
      alert(`Failed to update department. ${departmentId}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePTOBalanceChange = async () => {
    const balance = parseInt(ptoBalance);
    if (isNaN(balance)) {
      alert("Please enter a valid number");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updatePTOBalance(user.id, balance);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating PTO balance:", error);
      alert("Failed to update PTO balance");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteUser(user.id);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Select
          value={user.role}
          onValueChange={(value) => handleRoleChange(value as Role)}
          disabled={isUpdating || user.email === "bob@bob.bob"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={user.departmentId || ""}
          onValueChange={handleDepartmentChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={ptoBalance}
            onChange={(e) => setPTOBalance(e.target.value)}
            className="w-20 px-2 py-1 border rounded"
            disabled={isUpdating}
          />
          <Button
            onClick={handlePTOBalanceChange}
            variant="outline"
            size="sm"
            disabled={isUpdating || user.ptoBalance === parseInt(ptoBalance)}
          >
            Update
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          disabled={isDeleting || user.email === "bob@bob.bob"}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
