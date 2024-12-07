/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-i18n",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const table = await import("./infra/db");
    const bucket = await import("./infra/bucket");
    const api = await import("./infra/api");
  },
});
