"use server";

import { PrismaClient, Role, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { sendPTOEmail } from "@/lib/sendEmail";

const prisma = new PrismaClient();

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
) {
  try {
    const request = await prisma.pTORequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        user: true,
      },
    });

    // Send email notification
    await sendPTOEmail({
      to: request.user.email,
      userName: request.user.name,
      startDate: request.startDate,
      endDate: request.endDate,
      status: status,
      notes: `Your PTO request has been ${status.toLowerCase()} by the admin.`,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating request status:", error);
    return { success: false, error: "Failed to update request status" };
  }
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: Role
) {
  try {
    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "ACTIVE", // Since admin is creating, set as active
      },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
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

export async function assignRole(userId: string, role: Role) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error assigning role:", error);
    return { success: false, error: "Failed to assign role" };
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

export async function assignDepartmentManager(
  departmentId: string,
  managerId: string
) {
  try {
    // First, remove this manager from any other departments they might manage
    await prisma.department.updateMany({
      where: { managerId },
      data: { managerId: null },
    });

    // Then assign them to the new department
    await prisma.department.update({
      where: { id: departmentId },
      data: { managerId: managerId || null },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error assigning department manager:", error);
    return { success: false, error: "Failed to assign department manager" };
  }
}

export async function assignDepartmentApprover(
  departmentId: string,
  approverId: string
) {
  try {
    // Update the department's approver
    await prisma.department.update({
      where: { id: departmentId },
      data: { approverId: approverId || null },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error assigning department approver:", error);
    return { success: false, error: "Failed to assign department approver" };
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
