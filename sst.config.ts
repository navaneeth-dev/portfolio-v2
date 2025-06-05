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

    const sender = "rizexor.com";
    const email = $app.stage === "production" ? sst.aws.Email.get("MyEmail", sender) :
      new sst.aws.Email("MyEmail", {
        dmarc: "v=DMARC1; p=quarantine; adkim=s",
        sender,
        dns: sst.cloudflare.dns()
      });

    const api = new sst.aws.Function("MyApi", {
      handler: "sender.handler",
      link: [email],
      url: {
        cors: {
          allowMethods: ["POST"]
        }
      },
    });

    new sst.aws.Astro("MyWeb", {
      domain,
      link: [api]
    });
  },
});
