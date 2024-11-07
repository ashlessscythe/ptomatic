interface SendEmailProps {
  to: string;
  userName: string;
  startDate: Date;
  endDate: Date;
  status?: "PENDING" | "APPROVED" | "DENIED";
  notes?: string;
}

export async function sendPTOEmail({
  to,
  userName,
  startDate,
  endDate,
  status = "PENDING",
  notes,
}: SendEmailProps) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        userName,
        startDate,
        endDate,
        status,
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
