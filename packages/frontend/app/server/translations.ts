import { db } from "@sst-i18n/core"
import { createServerFn } from '@tanstack/start'
import { arkTypeValidator } from '@tanstack/arktype-adapter'
import { TranslationDefinition } from "@sst-i18n/core/translation.definition"
import { type } from "arktype"
export const getTranslations = createServerFn({
    method: 'GET',
}).handler(() => db.entities.translation.query.byLanguage({
    language: 'sv',
    projectId: 'ifsek',
    version: 'latest',
    namespace: "default"
}).go());

export const searchTranslations = createServerFn({
    method: 'GET',
})
    .validator(arkTypeValidator(type({
        "filter?": "string"
    })))
    .handler(({ data }) => db.entities.translation.query.byLanguage({
        language: 'sv',
        projectId: 'ifsek',
        version: 'latest',
        namespace: "default"
    }).begins({ key: data.filter?.toLowerCase() }).go());

export const createTranslation = createServerFn({ method: 'POST' })
    .validator(arkTypeValidator(TranslationDefinition))
    .handler(({ data }) => db.entities.translation.create(data).go());

export const updateTranslation = createServerFn({ method: 'POST' })
    .validator(arkTypeValidator(TranslationDefinition))
    .handler(({ data }) => db.entities.translation.patch(data).set({ translation: data.translation }).go());

export const updateTranslationKey = createServerFn({ method: 'POST' })
    .validator(arkTypeValidator(type({
        newKey: "string > 0",
        key: "string > 0",
        projectId: "string > 0",
        version: "string > 0",
        language: "string > 0",
        namespace: "string > 0"
    })))
    .handler(async ({ data }) => {

        await db.entities.translation.delete({
            ...data
        }).go();
        const created = await db.entities.translation.create({
            ...data,
            key: data.newKey
        }).go();
        return created;
    });