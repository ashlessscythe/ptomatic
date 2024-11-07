import * as React from "react";

interface PTORequestEmailProps {
  userName: string;
  startDate: Date;
  endDate: Date;
  status?: "PENDING" | "APPROVED" | "DENIED";
  notes?: string;
}

export const PTORequestEmail: React.FC<Readonly<PTORequestEmailProps>> = ({
  userName,
  startDate,
  endDate,
  status = "PENDING",
  notes,
}) => (
  <div>
    <h1>PTO Request {status === "PENDING" ? "Submitted" : status}</h1>
    <p>Hi {userName},</p>

    {status === "PENDING" ? (
      <p>Your PTO request has been submitted for review:</p>
    ) : (
      <p>Your PTO request has been {status.toLowerCase()}:</p>
    )}

    <div
      style={{
        margin: "20px 0",
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
      }}
    >
      <p>
        <strong>Start Date:</strong> {startDate.toLocaleDateString()}
      </p>
      <p>
        <strong>End Date:</strong> {endDate.toLocaleDateString()}
      </p>
      {notes && (
        <p>
          <strong>Notes:</strong> {notes}
        </p>
      )}
    </div>

    {status === "PENDING" && (
      <p>You will be notified when your request has been reviewed.</p>
    )}

    {status === "APPROVED" && <p>Enjoy your time off!</p>}

    {status === "DENIED" && (
      <p>Please contact your manager if you have any questions.</p>
    )}
  </div>
);
