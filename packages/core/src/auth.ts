// Lambda
import { handle } from "hono/aws-lambda"

import { MemoryStorage } from "@openauthjs/openauth/storage/memory";

import { authorizer } from "@openauthjs/openauth/authorizer";
import { CodeAdapter } from "@openauthjs/openauth/adapter/code";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { Resource } from "sst";
import { subjects } from "./subjects";
import { DynamoStorage } from "@openauthjs/openauth/storage/dynamo";
const sesClient = new SESv2Client();

const app = authorizer({
    providers: {
        code: CodeAdapter(CodeUI({
            sendCode: async (claims, code) => {
                const email = claims.email;
                if (!claims.email.endsWith("@solenergikvalitet.se")) {
                    throw new Error("Only solenergikvalitet.se emails are allowed");
                }
                console.log(`Send code ${code} to ${email}`);
                const cmd = new SendEmailCommand({
                    Destination: {
                        ToAddresses: [email]
                    },
                    FromEmailAddress: Resource.Email.sender.includes("@") ? Resource.Email.sender : `auth@${Resource.Email.sender}`,
                    Content: {
                        Simple: {
                            Body: {
                                Html: {
                                    Data: `Your pin code is <strong>${code}</strong>`,
                                },
                                Text: {
                                    Data: `Your pin code is ${code}`,
                                },
                            },
                            Subject: {
                                Data: "Pin Code: " + code,
                            },
                        },
                    },
                });
                await sesClient.send(cmd);
            }
        }))
    },
    subjects,
    async success(ctx, value) {

        return ctx.subject("user", { email: value.claims.email });
    },
    storage: DynamoStorage({
        table: Resource.Database.name
    }),
})

export const handler = handle(app);
