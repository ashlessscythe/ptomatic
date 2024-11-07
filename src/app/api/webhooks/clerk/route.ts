import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function validateRequest(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error("Error validating webhook: Missing svix headers");
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    return wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    throw new Error("Error verifying webhook");
  }
}

export async function POST(req: Request) {
  try {
    // If webhook secret is not set, accept all requests in development
    if (
      !process.env.CLERK_WEBHOOK_SECRET &&
      process.env.NODE_ENV === "development"
    ) {
      const payload = await req.json();
      const evt = { type: payload.type, data: payload.data } as WebhookEvent;
      console.log("Development mode - skipping webhook verification");
      return handleWebhook(evt);
    }

    const evt = await validateRequest(req);
    return handleWebhook(evt);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      error instanceof Error ? error.message : "Webhook processing failed",
      { status: 400 }
    );
  }
}

async function handleWebhook(evt: WebhookEvent) {
  if (!evt.data) {
    return new Response("No event data received", { status: 400 });
  }

  try {
    // Handle the webhook
    switch (evt.type) {
      case "user.created": {
        const userData = evt.data;
        const email = userData.email_addresses?.[0]?.email_address;

        if (!email) {
          throw new Error("No email address found for user");
        }

        // Create a new user in our database when they sign up with Clerk
        await prisma.user.create({
          data: {
            id: userData.id,
            email,
            name: `${userData.first_name || ""} ${
              userData.last_name || ""
            }`.trim(),
            role: "USER", // Default role
            ptoBalance: 0, // Default PTO balance
          },
        });
        break;
      }

      case "user.updated": {
        const userData = evt.data;
        const email = userData.email_addresses?.[0]?.email_address;

        if (!email) {
          throw new Error("No email address found for user");
        }

        // Check if user exists first
        const existingUser = await prisma.user.findUnique({
          where: { id: userData.id },
        });

        if (existingUser) {
          // Update user details in our database when they update in Clerk
          await prisma.user.update({
            where: { id: userData.id },
            data: {
              email,
              name: `${userData.first_name || ""} ${
                userData.last_name || ""
              }`.trim(),
            },
          });
        } else {
          // Create user if they don't exist
          await prisma.user.create({
            data: {
              id: userData.id,
              email,
              name: `${userData.first_name || ""} ${
                userData.last_name || ""
              }`.trim(),
              role: "USER",
              ptoBalance: 0,
            },
          });
        }
        break;
      }

      case "organizationMembership.created":
      case "organizationMembership.updated": {
        const membershipData = evt.data;
        const role = membershipData.role.toLowerCase();
        const userId = membershipData.public_user_data.user_id;
        const firstName = membershipData.public_user_data.first_name || "";
        const lastName = membershipData.public_user_data.last_name || "";
        const name = `${firstName} ${lastName}`.trim();

        console.log("Processing organization membership:", {
          userId,
          role,
          name,
        });

        // Check if user exists first
        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (existingUser) {
          // Update user's role if they exist
          await prisma.user.update({
            where: { id: userId },
            data: {
              role: role === "admin" ? "ADMIN" : "USER",
              name: name || existingUser.name, // Only update name if we have a new one
            },
          });
        } else {
          // For new users, we'll need to wait for the user.created event
          // to get their email address
          console.log(
            "User not found in database, waiting for user.created event"
          );
        }
        break;
      }

      case "user.deleted":
        // Delete user from our database when they're deleted from Clerk
        await prisma.user.delete({
          where: { id: evt.data.id },
        });
        break;

      default:
        console.log(`Unhandled webhook event type: ${evt.type}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new Response(
      error instanceof Error ? error.message : "Webhook processing failed",
      { status: 500 }
    );
  }
}
