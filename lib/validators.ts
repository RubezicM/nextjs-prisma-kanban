import { z } from "zod";

export const createBoardSchema = z.object({
    title: z.string().min(3, "Minimum 3 letters").max(30, "Title must be less than 30 characters"),
    slug: z.string().max(40, "Slug must be less than 40 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and can only contain letters, numbers, and hyphens"),
})
