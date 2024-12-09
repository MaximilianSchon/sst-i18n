import { createSubjects } from "@openauthjs/openauth/session";
import { type } from "arktype";

export const subjects = createSubjects({
    user: type({
        email: "string.email"
    })
});
