import { defineCollection } from "astro:content";
import { z } from "zod";

const blog = defineCollection({
  type: "content",
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
