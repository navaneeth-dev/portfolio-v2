import { defineCollection } from "astro:content";
import { z } from "zod";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().default("/sveltekit.png"),
    isDraft: z.boolean().optional().default(false),
    pubDate: z.string().transform((str) => new Date(str)),
  }),
});

export const collections = { blog };
