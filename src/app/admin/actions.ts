"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function makeUserAdmin(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error making user admin:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function assignDepartment(userId: string, departmentId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { departmentId: departmentId || null },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error assigning department:", error);
    return { success: false, error: "Failed to assign department" };
  }
}

export async function updatePTOBalance(userId: string, ptoBalance: number) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { ptoBalance },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating PTO balance:", error);
    return { success: false, error: "Failed to update PTO balance" };
  }
}

export async function createDepartment(name: string) {
  try {
    await prisma.department.create({
      data: { name },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, error: "Failed to create department" };
  }
}

export async function deleteDepartment(id: string) {
  try {
    // First, remove department from all users
    await prisma.user.updateMany({
      where: { departmentId: id },
      data: { departmentId: null },
    });

    // Then delete the department
    await prisma.department.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false, error: "Failed to delete department" };
  }
}