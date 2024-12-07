import { z } from "zod";
import { Type, type } from "arktype";



export function zod<
    Schema extends z.ZodSchema<any, any, any>,
    Return extends any
>(schema: Schema, func: (value: z.infer<Schema>) => Return) {
    const result = (input: z.infer<Schema>) => {
        const parsed = schema.parse(input);
        return func(parsed);
    };
    result.schema = schema;
    return result;
}


import { type } from 'arktype'


export function arktype<
    Schema extends Type,
    Return
>(schema: Schema, func: (value: Schema["infer"]) => Return) {
    const result = (input: Schema["infer"]) => {
        const parsed = schema(input); // Validate and parse using arktype
        return func(parsed);
    };
    result.schema = schema;
    return result;
}
