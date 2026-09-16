import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string().transform((str) => new Date(str)),
    image: z.string().optional().default("/sveltekit.png"),
    tags: z.array(z.string()),
    isDraft: z.boolean().optional().default(false),
    author: z.string(),
  }),
});

export const collections = { blog };
