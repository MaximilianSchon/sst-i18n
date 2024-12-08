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
        query: "string > 0"
    })))
    .handler(({ data }) => db.entities.translation.query.byLanguage({
        language: 'sv',
        projectId: 'ifsek',
        version: 'latest',
        namespace: "default"
    }).begins({ key: data.query.toLowerCase() }).go());

export const createTranslation = createServerFn({ method: 'POST' })
    .validator(arkTypeValidator(TranslationDefinition))
    .handler(({ data }) => db.entities.translation.create(data).go());