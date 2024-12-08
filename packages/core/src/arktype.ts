import { Type } from "arktype";

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
