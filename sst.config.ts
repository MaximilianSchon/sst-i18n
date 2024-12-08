/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-i18n",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  console: {
    autodeploy: {
      target(event) {
        if (event.type === "branch") {
          return {
            stage: event.branch
              .replace(/[^a-zA-Z0-9-]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-/g, "")
              .replace(/-$/g, ""),
            runner: {
              engine: "codebuild",
              compute: "small",
              timeout: "1 hour",
            },
          };
        }
      },
    },
  },
  async run() {
    const table = await import("./infra/db");
    const bucket = await import("./infra/bucket");
    const api = await import("./infra/api");
  }
})
