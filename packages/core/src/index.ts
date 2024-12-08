import { Service } from "electrodb";
import { Language } from "./language";
import { Translation } from "./translation";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Resource } from "sst";
import { Project } from "./project";
const client = new DynamoDBClient();

const table = Resource.Database.name;
export const db = new Service(
    {
        language: Language,
        translation: Translation,
        project: Project
    },
    { table, client },
);
