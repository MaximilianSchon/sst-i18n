import { bucket } from "./bucket";
import { frontend } from "./frontend";

export const apiFn = new sst.aws.Function("ApiFn", {
    handler: "packages/api/src/index.handler",
    url: true
})

const cachePolicy = new aws.cloudfront.CachePolicy(`CachePolicyForTranslationRouter`, {
    comment: `Cache policy for translation router`,
    defaultTtl: 0,
    maxTtl: 31536000, // 1 year
    minTtl: 0,
    parametersInCacheKeyAndForwardedToOrigin: {
        cookiesConfig: {
            cookieBehavior: "none",
        },
        headersConfig: {
            headerBehavior: "none",
        },
        queryStringsConfig: {
            queryStringBehavior: "all",
        },
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
    },
});

export const api = new sst.aws.Router("Router", {
    routes: {
        "/*": {
            bucket,
            rewrite: {
                regex: "(.*)",
                to: "/$1.json"
            }

        },
        "/private/*": apiFn.url,
        "/languages/*": apiFn.url,
        "/missing/*": apiFn.url,
        "/update/*": apiFn.url,
        "/admin": frontend.url
    },
    domain: $app.stage === "production" ? "translations.solenergikvalitet.se" : undefined,
    transform: {
        cdn: (opts) => {
            const cache = $resolve(opts.defaultCacheBehavior)
            opts.defaultCacheBehavior = cache.apply(c => ({ ...c, defaultTtl: 0, originRequestPolicyId: "b689b0a8-53d0-40ab-baf2-68738e2966ac", cachePolicyId: cachePolicy.id }));
            const behaviors = $resolve(opts.orderedCacheBehaviors!)
            // const behaviors = $resolve(opts.orderedCacheBehaviors)
            opts.orderedCacheBehaviors = behaviors.apply((bs) => {
                return bs.map(b => ({
                    ...b, defaultTtl: 0, originRequestPolicyId: "b689b0a8-53d0-40ab-baf2-68738e2966ac", cachePolicyId: cachePolicy.id
                }))
            });

        }
    }
})

// loadPath: 'https://api.locize.app/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // cloudfront -> s3 
// privatePath: 'https://api.locize.app/private/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // not sure
// getLanguagesPath: 'https://api.locize.app/languages/{{projectId}}', // hono
// addPath: 'https://api.locize.app/missing/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // hono
// updatePath: 'https://api.locize.app/update/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // hono