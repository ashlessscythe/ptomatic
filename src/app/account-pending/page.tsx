import { Card } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserStatus } from "@prisma/client";

export default async function AccountPending() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // If user is not pending, redirect to dashboard
  if (session.user.status !== UserStatus.PENDING) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 pt-16">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully but requires
            administrator approval.
          </p>
          <p className="text-gray-600">
            Please check back later or contact your administrator for
            assistance.
          </p>
        </div>
      </Card>
    </div>
  );
}
