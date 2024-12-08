import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Entity } from "electrodb";
import { Resource } from "sst";
const client = new DynamoDBClient();

const table = Resource.Database.name;

export const Translation = new Entity(
    {
        model: {
            entity: "translation",
            version: "1",
            service: "localization",
        },
        attributes: {
            language: {
                type: "string",
            },
            namespace: {
                type: "string",
            },
            version: {
                type: "string",
            },
            key: {
                type: "string",
                set: (key) => key?.toLowerCase(),
            },
            translation: {
                type: "string",
            },
            projectId: {
                type: "string",
            },
            createdAt: {
                type: "number",
                readOnly: true,
                required: true,
                default: () => Date.now(),
                set: () => Date.now(),
            },
            updatedAt: {
                type: "number",
                watch: "*",
                required: true,
                default: () => Date.now(),
                set: () => Date.now(),
            }
        },
        indexes: {
            byLanguage: {
                pk: {
                    field: "pk",
                    composite: ["projectId", "version", "language", "namespace"],
                },
                sk: {
                    field: "sk",
                    composite: ["key"],
                },
            },
        },
    },
    { client, table },
);


