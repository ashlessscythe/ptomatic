"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">
          Something went wrong!
        </h2>
        <p className="text-neutral-600 max-w-md">
          {error.message ||
            "An error occurred while loading the admin dashboard. Please try again."}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="default"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
