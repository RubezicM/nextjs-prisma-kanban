import { z } from "zod";

export const cardPrioritySchema = z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createBoardSchema = z.object({
  title: z.string().min(3, "Minimum 3 letters").max(30, "Title must be less than 30 characters"),
  slug: z
    .string()
    .max(40, "Slug must be less than 40 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and can only contain letters, numbers, and hyphens"
    ),
});

export const createCardSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z.string().optional(),
  listId: z.string().uuid("Invalid list ID"),
  boardSlug: z.string(),
});

export const updateCardPrioritySchema = z.object({
  cardId: z.string().uuid("Invalid card ID"),
  priority: cardPrioritySchema,
});

export const sortCardInListSchema = z.object({
  listId: z.string().uuid("Invalid list ID"),
  orderedCardIds: z.string().array(),
});

export const moveCardToColumnSchema = z.object({
  cardId: z.string().uuid("Invalid card ID"),
  listId: z.string().uuid("Invalid list ID"),
  order: z.number().int("Order must be an integer").optional(),
});

export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// This schema is used for validating the sign-up form data.
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
