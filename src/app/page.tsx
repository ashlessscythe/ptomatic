import { SignedIn, SignedOut } from "@clerk/nextjs";
import { PendingApproval } from "@/components/PendingApproval";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-73px)]">
      <SignedOut>
        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-neutral-50">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome to PTO-matic</h1>
            <p className="text-neutral-600">
              Sign in to manage your PTO requests
            </p>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <PendingApproval />
      </SignedIn>
    </main>
  );
}
