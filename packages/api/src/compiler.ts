import { TranslationDefinition, TranslationType } from "@sst-i18n/core/translation.definition";
import { DynamoDBStreamEvent, StreamRecord } from "aws-lambda";
import { type } from "arktype";
import { LanguageDefinition, LanguageType } from "@sst-i18n/core/language";
import { db } from "@sst-i18n/core";
import { ProjectDefinition, ProjectType } from "@sst-i18n/core/project";
import { arktype } from "@sst-i18n/core/arktype";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Resource } from "sst";
import { unmarshall as unmarshallDynamo } from "@aws-sdk/util-dynamodb";

const unmarshall = (item: Parameters<typeof unmarshallDynamo>[0]) => {
    return Object.fromEntries(
        Object.entries(unmarshallDynamo(item)).map(([key, value]) => {
            if (value instanceof Set) {
                return [key, Array.from(value)];
            }
            return [key, value];
        })
    );
};

export const handler = async (event: DynamoDBStreamEvent) => {
    for (const record of event.Records) {
        await handleRecord(record); // Not parallell because we don't want to override the same file.
    }
}

const handleRecord = async (record: DynamoDBStreamEvent["Records"][0]) => {
    if (!record.dynamodb) return;

    switch (record.eventName) {
        case "INSERT":
            await handleInsert(unmarshall(record.dynamodb.NewImage));
            // Translate if needed or update json.
            console.log("New image added: ", JSON.stringify(record.dynamodb.NewImage));
            break;
        case "MODIFY":
            await handleModify(unmarshall(record.dynamodb.NewImage));
            // Translate if needed, then update json.
            console.log("Image modified: ", JSON.stringify(record.dynamodb.NewImage));
            break;
        case "REMOVE":
            await handleRemove(unmarshall(record.dynamodb.OldImage));
            // Update json
            console.log("Image removed: ", JSON.stringify(record.dynamodb.OldImage));
            break;
        default:
            break;
    }
}

const handleInsert = async (record: StreamRecord | undefined) => {
    if (isTranslation(record)) {
        await updateJson(record)
    } else if (isLanguage(record)) {
        // Translate all translations for this language if needed
    }
}

const handleModify = async (record: StreamRecord | undefined) => {
    console.log(record);
    if (isTranslation(record)) {
        await updateJson(record)
    } else if (isLanguage(record)) {
        // Translate all translations for this language if needed
    }
}

const handleRemove = async (record: StreamRecord | undefined) => {
    if (isTranslation(record)) {
        await updateJson(record)
    } else if (isLanguage(record)) {
        // Delete all keys
    }
}

const performAutomaticTranslation = async (translation: TranslationType) => {
    const language = await db.entities.language.get({
        language: translation.language,
        projectId: translation.projectId,
    }).go();

    if (language.data?.shouldMachineTranslate) {
        // Translate
    }
}


const updateJson = arktype(type({
    projectId: "string",
    language: "string",
    namespace: "string",
    version: "string",
}), async (input) => {
    const all = await db.entities.translation.query.byLanguage({ ...input, key: undefined }).go({
        pages: 'all'
    });
    console.log(all.data, input);

    const json = all.data.reduce((acc, curr) => ({
        ...acc,
        [curr.key]: curr.translation
    }), {});
    await saveJson({
        data: json,
        key: `${input.projectId}/${input.version}/${input.language}/${input.namespace}.json`
    });
})

// loadPath: 'https://api.locize.app/{{projectId}}/{{version}}/{{lng}}/{{ns}}', // cloudfront -> s3 

const saveJson = arktype(type({
    data: "object",
    key: "string",
}), async (input) => {
    const client = new S3Client();
    const command = new PutObjectCommand({
        Bucket: Resource.Storage.name,
        Key: input.key,
        Body: JSON.stringify(input.data),
        ContentType: "application/json"
    });
    console.log(`Saving json to ${input.key}`);
    await client.send(command);

});

const isTranslation = (record: unknown): record is TranslationType => {
    const parsed = TranslationDefinition(record);
    return !(parsed instanceof type.errors);
}

const isLanguage = (record: unknown): record is LanguageType => {
    const parsed = LanguageDefinition(record);
    return !(parsed instanceof type.errors);
}

const isProject = (record: unknown): record is ProjectType => {
    const parsed = ProjectDefinition(record);
    return !(parsed instanceof type.errors);
}