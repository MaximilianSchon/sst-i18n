import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Entity } from "electrodb";
import { Resource } from "sst";
import { type } from "arktype";
const client = new DynamoDBClient();

const table = Resource.Database.name;

export const Project = new Entity(
    {
        model: {
            entity: "project",
            version: "1",
            service: "localization",
        },
        attributes: {
            projectId: {
                type: "string",
            },
            defaultLanguage: {
                type: "string",
                default: "en"
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
                    composite: [],
                },
            },
        },
    },
    { client, table },
);

export const ProjectDefinition = type({
    defaultLanguage: "string",
    projectId: "string",
});

export type ProjectType = typeof ProjectDefinition;