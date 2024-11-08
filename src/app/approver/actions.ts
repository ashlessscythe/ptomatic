"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendPTOEmail } from "@/lib/sendEmail";
import { RequestStatus, User } from "@prisma/client";
import type { Session } from "next-auth";

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
) {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const approver = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      approvedDepartments: {
        include: {
          users: true,
        },
      },
    },
  });

  if (!approver || approver.role !== "APPROVER") {
    throw new Error("Unauthorized - Approver access required");
  }

  const request = await prisma.pTORequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  // Verify the request belongs to a department this approver manages
  const canApprove = approver.approvedDepartments.some(
    (dept) => dept.id === request.user.department?.id
  );

  if (!canApprove) {
    throw new Error("Unauthorized - Not approver for this department");
  }

  // Update the request status
  const updatedRequest = await prisma.pTORequest.update({
    where: { id: requestId },
    data: { status },
    include: {
      user: true,
    },
  });

  // Send email notification
  await sendPTOEmail({
    to: updatedRequest.user.email,
    userName: updatedRequest.user.name,
    startDate: updatedRequest.startDate,
    endDate: updatedRequest.endDate,
    status: status,
    notes: `Your PTO request has been ${status.toLowerCase()} by the department approver.`,
  });

  revalidatePath("/approver");
  return updatedRequest;
}
