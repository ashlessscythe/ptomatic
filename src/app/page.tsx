import { getServerSession } from "next-auth";
import { PendingApproval } from "@/components/PendingApproval";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen flex items-start justify-center bg-gray-50 pt-16">
      {session ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to PTO-matic</h1>
          <p className="text-lg text-gray-600 mb-8">
            Manage your time off requests efficiently
          </p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <div className="text-center ">
          <h1 className="text-4xl font-bold mb-4">Welcome to PTO-matic</h1>
          <p className="text-lg text-gray-600 mb-8">
            Sign in to manage your PTO requests
          </p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
