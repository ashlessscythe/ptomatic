"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createPTORequest } from "../actions";

interface PTORequestFormProps {
  userId: string;
}

export function PTORequestForm({ userId }: PTORequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const startDate = new Date(formData.get("startDate") as string);
      const endDate = new Date(formData.get("endDate") as string);
      const notes = formData.get("notes") as string;

      const result = await createPTORequest(userId, {
        startDate,
        endDate,
        notes: notes || undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to create PTO request");
        return;
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error submitting PTO request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          PTO request submitted successfully!
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            className="w-full px-3 py-2 border rounded"
            required
            min={new Date().toISOString().split("T")[0]}
            onChange={() => {
              setError(null);
              setSuccess(false);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            className="w-full px-3 py-2 border rounded"
            required
            min={new Date().toISOString().split("T")[0]}
            onChange={() => {
              setError(null);
              setSuccess(false);
            }}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          rows={3}
          className="w-full px-3 py-2 border rounded"
          placeholder="Add any additional notes..."
          onChange={() => {
            setError(null);
            setSuccess(false);
          }}
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
