const email = sst.aws.Email.get("Email", process.env["EMAIL_SENDER"])

export const authFn = new sst.aws.Auth("Auth", {
    authenticator: {
        url: true,
        handler: "packages/core/src/auth.handler",
        link: [email]
    }
})