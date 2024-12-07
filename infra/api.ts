import { bucket } from "./bucket";

export const apiFn = new sst.aws.Function("ApiFn", {
    handler: "packages/api/src/index.handler",
    url: true
})

export const api = new sst.aws.Router("Api", {
    routes: {
        "/*": {
            bucket
        },
        "/private/*": apiFn.url,
        "/languages/*": apiFn.url,
        "/missing/*": apiFn.url,
        "/update/*": apiFn.url
    }
})

// loadPath: 'https://api.locize.app/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // cloudfront -> s3 
// privatePath: 'https://api.locize.app/private/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // not sure
// getLanguagesPath: 'https://api.locize.app/languages/{{projectId}}', // hono
// addPath: 'https://api.locize.app/missing/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // hono
// updatePath: 'https://api.locize.app/update/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // hono