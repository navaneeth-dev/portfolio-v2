import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import autolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import react from "@astrojs/react";

// https://astro.build/config
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: "https://rizexor.com",
  markdown: {
    rehypePlugins: [rehypeHeadingIds, [autolinkHeadings, {}]],
  },
  integrations: [
    image({ serviceEntryPoint: "@astrojs/image/sharp" }),
    mdx(),
    sitemap(),
    tailwind(),
    react(),
  ],
});
