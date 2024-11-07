"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendPTOEmail } from "@/lib/sendEmail";

const prisma = new PrismaClient();

export async function createPTORequest(
  userId: string,
  data: {
    startDate: Date;
    endDate: Date;
    notes?: string;
  }
) {
  try {
    // Validate dates
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (start > end) {
      return {
        success: false,
        error: "Start date must be before end date",
      };
    }

    if (start < new Date()) {
      return {
        success: false,
        error: "Cannot create PTO request for past dates",
      };
    }

    // Calculate number of business days
    const days = getBusinessDays(start, end);
    const hours = days * 8; // Assuming 8-hour workdays

    // Get user's current PTO balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if user has enough PTO balance
    if (user.ptoBalance < hours) {
      return {
        success: false,
        error: `Not enough PTO balance. Request needs ${hours} hours, but only ${user.ptoBalance} hours available.`,
      };
    }

    // Create the PTO request
    const ptoRequest = await prisma.pTORequest.create({
      data: {
        userId,
        startDate: start,
        endDate: end,
        notes: data.notes,
        status: "PENDING",
      },
    });

    console.log(`Request: ${ptoRequest}`);

    // Send email notification
    await sendPTOEmail({
      to: user.email,
      userName: user.name,
      startDate: start,
      endDate: end,
      notes: data.notes,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating PTO request:", error);
    return {
      success: false,
      error: "Failed to create PTO request",
    };
  }
}

// Helper function to calculate business days between two dates
function getBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

export async function cancelPTORequest(requestId: string, userId: string) {
  try {
    const request = await prisma.pTORequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    if (request.userId !== userId) {
      return {
        success: false,
        error: "Not authorized to cancel this request",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        error: "Can only cancel pending requests",
      };
    }

    // Update the request status
    await prisma.pTORequest.update({
      where: { id: requestId },
      data: { status: "DENIED" },
    });

    // Send email notification
    await sendPTOEmail({
      to: request.user.email,
      userName: request.user.name,
      startDate: request.startDate,
      endDate: request.endDate,
      status: "DENIED",
      notes: request.notes || undefined,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error canceling PTO request:", error);
    return {
      success: false,
      error: "Failed to cancel PTO request",
    };
  }
}

export async function updatePTORequestStatus(
  requestId: string,
  status: "APPROVED" | "DENIED"
) {
  try {
    const request = await prisma.pTORequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    // Update the request status
    await prisma.pTORequest.update({
      where: { id: requestId },
      data: { status },
    });

    // Send email notification
    await sendPTOEmail({
      to: request.user.email,
      userName: request.user.name,
      startDate: request.startDate,
      endDate: request.endDate,
      status,
      notes: request.notes || undefined,
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating PTO request:", error);
    return {
      success: false,
      error: "Failed to update PTO request",
    };
  }
}
