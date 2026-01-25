"use server";

import { Resend } from "resend";
import { getErrorMessage } from "@/lib/errors";

// Send email using Resend API
export async function sendEmail({ to, subject, react }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    // Send email with React component as body
    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}