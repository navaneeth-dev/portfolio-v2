/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "portfolio-v2",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {aws: {region: "ap-south-1"}, cloudflare: "6.2.0"},
    };
  },
  async run() {
    new sst.aws.Astro("MyWeb", {
      domain: {
        name: "rizexor.com", dns: sst.cloudflare.dns({zone: "c5f1a318759646d6efea6245b42e0f44"}),
      },
    });
  },
});
