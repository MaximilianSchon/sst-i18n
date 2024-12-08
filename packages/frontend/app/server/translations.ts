import { db } from "@sst-i18n/core"
import { createServerFn } from '@tanstack/start'
import { arkTypeValidator } from '@tanstack/arktype-adapter'
import { TranslationDefinition } from "@sst-i18n/core/translation.definition"

export const getTranslations = createServerFn({
    method: 'GET',
}).handler(() => db.entities.translation.scan.go());

export const createTranslation = createServerFn({ method: 'POST' })
    .validator(arkTypeValidator(TranslationDefinition))
    .handler(({ data }) => db.entities.translation.create(data).go());