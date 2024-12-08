/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-i18n",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-north-1",
        }
      },
    };
  },
  async run() {
    const table = await import("./infra/db");
    const bucket = await import("./infra/bucket");
    const api = await import("./infra/api");
    const frontend = await import("./infra/frontend");
    const streams = await import("./infra/streams");
  }
})
