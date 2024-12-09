
import { createClient } from "@openauthjs/openauth"
import { Resource } from 'sst/resource'
import { useAppSession } from '@/lib/session'
import { subjects } from "@sst-i18n/core/subjects"
import { redirect, type BeforeLoadFn } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { type } from "arktype"

export const handleAuth = createServerFn()
    .validator(type({
        "code?": "string"
    }))
    .handler(async ({ data }) => {
        const redirect_uri = Resource.App.stage === "main" ? "https://translations.solenergikvalitet.se/admin" : "http://localhost:3000"
        const client = createClient({
            clientID: "translation",
            issuer: Resource.App.stage === "main" ? "https://auth.translations.solenergikvalitet.se" : `https://auth.translations.${Resource.App.stage}.solenergikvalitet.se`,
        })
        const session = await useAppSession()
        console.log(session.data);

        if (!session.data.email && !data.code) {
            const newUrl = client.authorize(redirect_uri, "code");
            redirect({
                href: newUrl,
                throw: true
            });
        } else if (!session.data.email && data.code) {
            try {

                const tokens = await client.exchange(data.code, redirect_uri) // the redirect_uri is the original redirect_uri you passed in and is used for verification
                console.log(tokens);
                const token = await client.verify(subjects, tokens.access, { refresh: tokens.refresh })
                console.log(token);
                await session.update({
                    email: token.subject?.properties?.email,
                    access: tokens.access,
                    refresh: tokens.refresh
                })
            } finally {
                redirect({
                    href: "/",
                    throw: true
                })
            }

        } else if (session.data.email) {
            const token = await client.verify(subjects, session.data.access, { refresh: session.data.refresh })
            await session.update({
                email: token.subject?.properties?.email || session.data.email,
                access: token.tokens?.access,
                refresh: token.tokens?.refresh
            })
        }
        return session.data

    });