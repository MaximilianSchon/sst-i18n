import { type } from "arktype";

export const TranslationDefinition = type({
    language: "string > 0",
    key: "string > 0",
    "translation?": "string",
    namespace: "string > 0",
    version: "string > 0",
    projectId: "string > 0"
});

export type TranslationType = typeof TranslationDefinition.infer;