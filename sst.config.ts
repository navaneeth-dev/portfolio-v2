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
    const domain = {
      name: "rizexor.com",
      dns: sst.cloudflare.dns()
    };

    const email = new sst.aws.Email("MyEmail", {
      sender: "blog@rizexor.com",
    });

    const api = new sst.aws.Function("MyApi", {
      handler: "sender.handler",
      link: [email],
      url: true,
    });

    new sst.aws.Astro("MyWeb", {
      domain,
    });
  },
});
