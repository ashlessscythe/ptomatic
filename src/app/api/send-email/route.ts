import { Resend } from "resend";
import { PTORequestEmail } from "@/components/emails/PTORequestEmail";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      to,
      userName,
      startDate,
      endDate,
      status = "PENDING",
      notes,
    } = body;

    const data = await resend.emails.send({
      from: "PTO-matic <onboarding@resend.dev>",
      to: [to],
      subject: `PTO Request ${status === "PENDING" ? "Submitted" : status}`,
      text: "", // Required by Resend
      react: PTORequestEmail({
        userName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        notes,
      }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
