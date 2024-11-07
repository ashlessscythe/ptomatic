import { Card } from "@/components/ui/card";

export function PendingApproval() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <Card className="w-[380px] p-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Account Pending
          </h1>
          <p className="text-sm text-neutral-500">
            Your account is pending approval from an administrator. You will be
            notified once your account has been approved.
          </p>
          <div className="mt-4">
            <div className="animate-pulse flex justify-center">
              <div className="h-2 w-24 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
