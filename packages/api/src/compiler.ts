import { TranslationDefinition, TranslationType } from "@sst-i18n/core/translation";
import { DynamoDBStreamEvent, StreamRecord } from "aws-lambda";
import { type } from "arktype";
import { LanguageDefinition, LanguageType } from "@sst-i18n/core/language";
import { db } from "@sst-i18n/core";
import { ProjectDefinition, ProjectType } from "@sst-i18n/core/project";
import { arktype } from "@sst-i18n/core/ark";

export const handler = async (event: DynamoDBStreamEvent) => {
    await Promise.all(event.Records.map(handleRecord));
}

const handleRecord = (record: DynamoDBStreamEvent["Records"][0]) => {
    if (!record.dynamodb) return;

    switch (record.eventName) {
        case "INSERT":
            handleInsert(record.dynamodb.NewImage);
            // Translate if needed or update json.
            console.log("New image added: ", JSON.stringify(record.dynamodb.NewImage));
            break;
        case "MODIFY":
            handleModify(record.dynamodb.NewImage);
            // Translate if needed, then update json.
            console.log("Image modified: ", JSON.stringify(record.dynamodb.NewImage));
            break;
        case "REMOVE":
            handleRemove(record.dynamodb.OldImage);
            // Update json
            console.log("Image removed: ", JSON.stringify(record.dynamodb.OldImage));
            break;
        default:
            break;
    }
}

const handleInsert = (record: StreamRecord | undefined) => {
    if (isTranslation(record)) {
        // Translate if needed
    } else if (isLanguage(record)) {
        // Translate all translations for this language if needed
    }
}

const handleModify = (record: StreamRecord | undefined) => {
    if (isTranslation(record)) {

        // Translate if needed
    } else if (isLanguage(record)) {
        // Translate all translations for this language if needed
    }
}

const handleRemove = (record: StreamRecord | undefined) => {
    if (isTranslation(record)) {
        // Update json
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
    const all = await db.entities.translation.query.byLanguage(input).go({
        pages: 'all'
    });

    const json = all.data.reduce((acc, curr) => ({
        ...acc,
        [curr.key]: curr.translation
    }), {});

})

const saveJson = arktype(type({
    data: "object",
    key: "string",
}), async (input) => {
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