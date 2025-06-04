import {Resource} from "sst";
import {SendEmailCommand, SESv2Client} from "@aws-sdk/client-sesv2";
import type {LambdaFunctionURLEvent, LambdaFunctionURLHandler} from "aws-lambda";
import {z} from "zod/v4";

const ContactEvent = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
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
      message: params.get("message") || "",
    };
    await ContactEvent.parseAsync(contactEvent);

    await client.send(
      new SendEmailCommand({
        FromEmailAddress: Resource.MyEmail.sender,
        Destination: {
          ToAddresses: [Resource.MyEmail.sender],
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
        Location: "https://rizexor.com/contact"
      }
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {statusCode: 400, body: error.message};
    }

    return {statusCode: 500, body: "Internal error"};
  }
};