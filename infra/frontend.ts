import { db } from "./db";

export const frontend = new sst.aws.TanstackStart("Frontend", {
    path: "packages/frontend",
    link: [
        db,
    ]
});