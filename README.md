# Astro Portfolio V2

```
npm create astro@latest -- --template blog
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/s/github/withastro/astro/tree/latest/examples/blog)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!


![blog](https://user-images.githubusercontent.com/4677417/186189140-4ef17aac-c3c9-4918-a8c2-ce86ba1bb394.png)

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## Deployment

The site deploys to Vercel as static Astro pages with one on-demand route at
`/api/contact`. Connect this repository to Vercel for production and preview
deployments, then enable Web Analytics in the project dashboard.

Configure these environment variables in Vercel:

- `HCAPTCHA_SECRET`
- `AWS_REGION=ap-south-1`
- `AWS_ROLE_ARN`

The SES client uses Vercel's OIDC credentials provider when `AWS_ROLE_ARN` is
set. Configure the role to trust your Vercel project's OIDC identity and allow
`ses:SendEmail` on the verified sender identity. Scope its trust policy to the
intended team, project, and environments, including `development` for local
OIDC testing. Follow [Vercel's AWS OIDC setup](https://vercel.com/docs/oidc/aws).

For local OIDC development, run `vercel env pull .env` from the linked project
to load `VERCEL_OIDC_TOKEN` and the role configuration (back up local overrides
first). Refresh the token with the same command when it expires, then restart
the dev server. Deployed functions obtain the token from Vercel's request
context. When `AWS_ROLE_ARN` is unset, the SDK uses its default credential chain,
such as a local AWS profile or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.
An OIDC failure does not fall back to static credentials. See `.env.example`.

If SES reports `MessageRejected: Email address is not verified`, verify
`notifications@noreply.rizexor.com` or a covering domain identity in the same
AWS account and region used by the client (`ap-south-1` by default). In the SES
sandbox, the recipient `me@rizexor.com` must also be verified. OIDC supplies
credentials; it does not verify email identities. See
[AWS SES identity verification](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html).

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
