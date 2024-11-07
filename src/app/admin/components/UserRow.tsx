"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  makeUserAdmin,
  deleteUser,
  assignDepartment,
  updatePTOBalance,
} from "../actions";
import { Department, User } from "@prisma/client";
import { useState } from "react";

type UserWithDepartment = User & {
  department: Department | null;
};

interface UserRowProps {
  user: UserWithDepartment;
  departments: Department[];
}

export function UserRow({ user, departments }: UserRowProps) {
  const [isUpdatingPTO, setIsUpdatingPTO] = useState(false);
  const [isAssigningDept, setIsAssigningDept] = useState(false);
  const [isMakingAdmin, setIsMakingAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePTOUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdatingPTO(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const balance = parseInt(formData.get("ptoBalance") as string);
      const result = await updatePTOBalance(user.id, balance);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating PTO balance:", error);
      alert("Failed to update PTO balance");
    } finally {
      setIsUpdatingPTO(false);
    }
  };

  const handleDepartmentAssign = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsAssigningDept(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const deptId = formData.get("departmentId") as string;
      const result = await assignDepartment(user.id, deptId);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error assigning department:", error);
      alert("Failed to assign department");
    } finally {
      setIsAssigningDept(false);
    }
  };

  const handleMakeAdmin = async () => {
    setIsMakingAdmin(true);
    try {
      const result = await makeUserAdmin(user.id);
      if (!result.success && result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error making user admin:", error);
      alert("Failed to make user admin");
    } finally {
      setIsMakingAdmin(false);
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
      <TableCell>{user.role}</TableCell>
      <TableCell>
        <form className="flex items-center gap-2" onSubmit={handlePTOUpdate}>
          <input
            type="number"
            name="ptoBalance"
            defaultValue={user.ptoBalance}
            className="w-20 px-2 py-1 border rounded"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isUpdatingPTO}
          >
            {isUpdatingPTO ? "Updating..." : "Update"}
          </Button>
        </form>
      </TableCell>
      <TableCell>
        <form
          className="flex items-center gap-2"
          onSubmit={handleDepartmentAssign}
        >
          <select
            name="departmentId"
            defaultValue={user.departmentId || ""}
            className="px-2 py-1 border rounded"
          >
            <option value="">No Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isAssigningDept}
          >
            {isAssigningDept ? "Assigning..." : "Assign"}
          </Button>
        </form>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {user.role === "USER" && (
            <Button
              onClick={handleMakeAdmin}
              variant="outline"
              size="sm"
              disabled={isMakingAdmin}
            >
              {isMakingAdmin ? "Updating..." : "Make Admin"}
            </Button>
          )}
          <Button
            onClick={handleDelete}
            variant="destructive"
            size="sm"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
