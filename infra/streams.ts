import { bucket } from "./bucket";
import { db } from "./db";

db.subscribe("CompileNewFiles", {
    handler: "packages/api/src/compiler.handler",
    link: [
        db,
        bucket
    ]
})