import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Entity } from "electrodb";
import { Resource } from "sst";
import { type } from "arktype";
const client = new DynamoDBClient();

const table = Resource.Database.name;

export const Language = new Entity(
    {
        model: {
            entity: "language",
            version: "1",
            service: "localization",
        },
        attributes: {
            language: {
                type: "string",
            },
            projectId: {
                type: "string",
            },
            shouldMachineTranslate: {
                type: "boolean",
                default: false
            }
        },
        indexes: {
            byProjectId: {
                pk: {
                    field: "pk",
                    composite: ["projectId"],
                },
                sk: {
                    field: "sk",
                    composite: ["language"],
                },
            },
        },
    },
    { client, table },
);

export const LanguageDefinition = type({
    language: "string",
    projectId: "string",
    shouldMachineTranslate: "boolean"
});

export type LanguageType = typeof LanguageDefinition;