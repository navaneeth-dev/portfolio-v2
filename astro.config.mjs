import {defineConfig} from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import {rehypeHeadingIds} from "@astrojs/markdown-remark";
import autolinkHeadings from "rehype-autolink-headings";
import {h, s} from "hastscript";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import react from "@astrojs/react";

// The following configuration for rehype-autolink-headings was taken from https://github.com/withastro/docs/blob/main/astro.config.ts
import aws from "astro-sst";

const AnchorLinkIcon = h(
  "svg",
  {
    width: 16,
    height: 16,
    version: 1.1,
    viewBox: "0 0 16 16",
    xlmns: "http://www.w3.org/2000/svg",
  },
  h("path", {
    fillRule: "evenodd",
    fill: "currentcolor",
    d: "M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z",
  }),
);
const createSROnlyLabel = (text) => {
  const node = h("span.sr-only", `Section titled ${escape(text)}`);
  node.properties["is:raw"] = true;
  return node;
};

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
  site: "https://rizexor.com",
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "catppuccin-mocha",
    },
    rehypePlugins: [
      rehypeHeadingIds,
      [
        autolinkHeadings,
        {
          behavior: "append",
          properties: {
            class: "autolink-header",
            ariaHidden: true,
            tabIndex: -1,
          },
          content: [
            h("span.sr-only", " permalink"),
            s(
              "svg.inline.ml-2.hover:text-neutral-500",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: 24,
                height: 24,
                fill: "currentColor",
                viewBox: "0 0 24 24",
              },
              s("path", {
                d: "M9.199 13.599a5.99 5.99 0 0 0 3.949 2.345 5.987 5.987 0 0 0 5.105-1.702l2.995-2.994a5.992 5.992 0 0 0 1.695-4.285 5.976 5.976 0 0 0-1.831-4.211 5.99 5.99 0 0 0-6.431-1.242 6.003 6.003 0 0 0-1.905 1.24l-1.731 1.721a.999.999 0 1 0 1.41 1.418l1.709-1.699a3.985 3.985 0 0 1 2.761-1.123 3.975 3.975 0 0 1 2.799 1.122 3.997 3.997 0 0 1 .111 5.644l-3.005 3.006a3.982 3.982 0 0 1-3.395 1.126 3.987 3.987 0 0 1-2.632-1.563A1 1 0 0 0 9.201 13.6zm5.602-3.198a5.99 5.99 0 0 0-3.949-2.345 5.987 5.987 0 0 0-5.105 1.702l-2.995 2.994a5.992 5.992 0 0 0-1.695 4.285 5.976 5.976 0 0 0 1.831 4.211 5.99 5.99 0 0 0 6.431 1.242 6.003 6.003 0 0 0 1.905-1.24l1.723-1.723a.999.999 0 1 0-1.414-1.414L9.836 19.81a3.985 3.985 0 0 1-2.761 1.123 3.975 3.975 0 0 1-2.799-1.122 3.997 3.997 0 0 1-.111-5.644l3.005-3.006a3.982 3.982 0 0 1 3.395-1.126 3.987 3.987 0 0 1 2.632 1.563 1 1 0 0 0 1.602-1.198z",
              }),
            ),
          ],
        },
      ],
    ],
  },
  integrations: [mdx(), sitemap(), tailwind(), react()],
  output: "static",
  adapter: aws(),
});
