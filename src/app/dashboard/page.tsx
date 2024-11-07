import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { PTORequestForm } from "./components/PTORequestForm";
import { PTORequestList } from "./components/PTORequestList";

const prisma = new PrismaClient();

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Get user data including PTO requests and department
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      ptoRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  // Calculate remaining PTO days this year
  const remainingPTO = user.ptoBalance;
  const pendingPTORequests = user.ptoRequests.filter(
    (request) => request.status === "PENDING"
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user.name}</h1>
        <div className="flex gap-6 text-sm">
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <p className="text-neutral-600">Department</p>
            <p className="font-medium">
              {user.department?.name || "Unassigned"}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <p className="text-neutral-600">PTO Balance</p>
            <p className="font-medium">{remainingPTO} hours available</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <p className="text-neutral-600">Pending Requests</p>
            <p className="font-medium">{pendingPTORequests}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Request Time Off</h2>
          <PTORequestForm userId={user.id} />
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">PTO Requests</h2>
          <PTORequestList requests={user.ptoRequests} userId={user.id} />
        </section>
      </div>
    </div>
  );
}
