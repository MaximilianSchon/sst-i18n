// app/routes/__root.tsx
import {
    Outlet,
    ScrollRestoration,
    createRootRouteWithContext,
    redirect,
} from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'
import type { ReactNode } from 'react'
import css from "@/styles/main.css?url"
import { handleAuth } from '@/server/auth'


export const Route = createRootRouteWithContext<{ user?: { email: string } }>()({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'TanStack Start Starter',
            },
        ],
        links: [{ rel: "stylesheet", href: css }],
    }),
    component: RootComponent,
    beforeLoad: async ({ context, location }) => {
        const session = await handleAuth({ data: { code: location.search?.code } })
        return {
            user: session
        }
    },

})

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html>
            <head>
                <Meta />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}