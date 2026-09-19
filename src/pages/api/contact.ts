import {SendEmailCommand, SESv2Client} from "@aws-sdk/client-sesv2";
import type {APIRoute} from "astro";
import {z} from "zod/v4";

export const prerender = false;

const ContactEvent = z.object({
  firstname: z.string().min(3).max(256),
  lastname: z.string().min(3).max(256),
  email: z.email().max(256),
  subject: z.string().min(4).max(256),
  "h-captcha-response": z.string().min(1),
  message: z.string().max(10000),
});

const client = new SESv2Client({
  region: process.env.AWS_REGION ?? "ap-south-1",
});

export const POST: APIRoute = async ({request, clientAddress, redirect}) => {
  try {
    if (!process.env.HCAPTCHA_SECRET) {
      throw new Error("HCAPTCHA_SECRET is not configured");
    }

    const form = await request.formData();
    const contact = ContactEvent.parse({
      firstname: form.get("firstname"),
      lastname: form.get("lastname"),
      email: form.get("email"),
      subject: form.get("subject"),
      "h-captcha-response": form.get("h-captcha-response"),
      message: form.get("message"),
    });

    const hcaptchaResponse = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET,
        response: contact["h-captcha-response"],
        remoteip: clientAddress,
      }),
    });
    const hcaptchaResult = (await hcaptchaResponse.json()) as {success?: boolean};

    if (!hcaptchaResponse.ok || hcaptchaResult.success !== true) {
      return new Response("Please solve the captcha", {status: 400});
    }

    await client.send(
      new SendEmailCommand({
        FromEmailAddress: "notifications@noreply.rizexor.com",
        Destination: {
          ToAddresses: ["me@rizexor.com"],
        },
        ReplyToAddresses: [contact.email],
        Content: {
          Simple: {
            Subject: {
              Data: `${contact.subject} - Navaneeth (rizexor.com)`,
            },
            Body: {
              Text: {
                Data: `Message From: ${contact.firstname} ${contact.lastname}\n\n${contact.message}`,
              },
            },
          },
        },
      }),
    );

    return redirect("/success", 303);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, {status: 400});
    }

    console.error("Failed to send contact email", error);
    return new Response("Internal error", {status: 500});
  }
};
