"use client";

import { useState } from "react";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createUser } from "../actions";

export function AddUserModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = Object.values(Role);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const role = formData.get("role") as Role;

      if (name && email && password && role) {
        const result = await createUser(
          name.trim(),
          email.trim(),
          password,
          role
        );
        if (result.success) {
          setOpen(false);
          form.reset();
        } else if (result.error) {
          alert(result.error);
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="px-3 py-2 border rounded-md"
              placeholder="Full Name"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="px-3 py-2 border rounded-md"
              placeholder="email@example.com"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="px-3 py-2 border rounded-md"
              placeholder="••••••••"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              name="role"
              required
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
