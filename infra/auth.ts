import { db } from "./db";

const email = sst.aws.Email.get("Email", process.env["EMAIL_SENDER"])

export const authFn = new sst.aws.Auth("AuthFn", {
    authenticator: {
        url: true,
        handler: "packages/core/src/auth.handler",
        link: [email, db]
    }
})

export const authRouter = new sst.aws.Router("Auth", {
    domain: $app.stage === "main" ? "auth.translations.solenergikvalitet.se" : `auth.translations.${$app.stage}.solenergikvalitet.se`,
    routes: {
        "/*": authFn.url
    }
});