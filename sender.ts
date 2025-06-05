import {Resource} from "sst";
import {SendEmailCommand, SESv2Client} from "@aws-sdk/client-sesv2";
import type {LambdaFunctionURLEvent, LambdaFunctionURLHandler} from "aws-lambda";
import {z} from "zod/v4";

const ContactEvent = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
    'h-captcha-response': z.string(),
    message: z.string().max(10000)
});

const client = new SESv2Client();

export const handler: LambdaFunctionURLHandler = async (event: LambdaFunctionURLEvent) => {
    try {
        if (event.requestContext.http.method !== "POST")
            return {statusCode: 405, body: "Not allowed!"};

        if (!event.body)
            return {statusCode: 400, body: "Missing body!"};

        const params = new URLSearchParams(atob(event.body));

        const contactEvent: z.infer<typeof ContactEvent> = {
            firstname: params.get("firstname") || "",
            lastname: params.get("lastname") || "",
            email: params.get("email") || "",
            'h-captcha-response': params.get("h-captcha-response") || "",
            message: params.get("message") || "",
        };
        await ContactEvent.parseAsync(contactEvent);

        const hcaptchaResponse = await fetch("https://api.hcaptcha.com/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                secret: Resource.MySecret.value,
                response: contactEvent["h-captcha-response"],
                remoteip: event.requestContext.http.sourceIp,
            })
        });
        const hcaptchaJSON = await hcaptchaResponse.json();
        if (hcaptchaJSON['success'] !== true)
            return {
                statusCode: 400,
                body: "Please solve the captcha"
            };

        await client.send(
            new SendEmailCommand({
                FromEmailAddress: "contact@" + Resource.MyEmail.sender,
                Destination: {
                    ToAddresses: ["contact@" + Resource.MyEmail.sender],
                },
                Content: {
                    Simple: {
                        Subject: {
                            Data: `Contact Request ${contactEvent.firstname} ${contactEvent.lastname} ${contactEvent.email}`,
                        },
                        Body: {
                            Text: {
                                Data: contactEvent.message,
                            },
                        },
                    },
                },
            })
        );

        return {
            statusCode: 301,
            headers: {
                Location: "https://rizexor.com/success"
            }
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {statusCode: 400, body: error.message};
        }

        return {statusCode: 500, body: "Internal error"};
    }
};