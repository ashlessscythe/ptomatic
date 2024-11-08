import { formatDate } from "@/lib/utils";

interface PTORequestEmailProps {
  userName: string;
  startDate: Date;
  endDate: Date;
  status?: string;
  notes?: string;
}

export function PTORequestEmail({
  userName,
  startDate,
  endDate,
  status = "PENDING",
  notes,
}: PTORequestEmailProps) {
  return (
    <div>
      <h1>PTO Request {status.toLowerCase()}</h1>
      <p>Hello {userName},</p>
      <p>Your PTO request has been {status.toLowerCase()}.</p>
      <p>
        <strong>Start Date:</strong> {formatDate(startDate)}
      </p>
      <p>
        <strong>End Date:</strong> {formatDate(endDate)}
      </p>
      {notes && (
        <p>
          <strong>Notes:</strong> {notes}
        </p>
      )}
      <p>Thank you for using PTO-matic!</p>
    </div>
  );
}
