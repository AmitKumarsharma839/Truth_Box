import { PostType } from "@prisma/client";
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(120),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be under 24 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128)
});

export const communitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Community name must be at least 3 characters")
    .max(32, "Community name must be under 32 characters")
    .regex(/^[a-zA-Z0-9_ -]+$/, "Use letters, numbers, spaces, hyphens, and underscores"),
  description: z.string().trim().max(180, "Description is too long").optional()
});

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
    message: "Enter a full URL starting with http:// or https://"
  });

const optionalImageSource = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || /^https?:\/\/.+/i.test(value) || value.startsWith("/uploads/"), {
    message: "Upload an image or enter a valid image URL"
  });

export const postSchema = z
  .object({
    title: z.string().trim().min(4, "Title must be at least 4 characters").max(160),
    content: z.string().trim().max(8000).optional(),
    url: optionalUrl,
    imageUrl: optionalImageSource,
    type: z.nativeEnum(PostType),
    communitySlug: z.string().trim().min(1)
  })
  .superRefine((data, ctx) => {
    if (data.type === PostType.TEXT && !data.content) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Text posts need body content",
        path: ["content"]
      });
    }

    if (data.type === PostType.LINK && !data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link posts need a URL",
        path: ["url"]
      });
    }

    if (data.type === PostType.IMAGE && !data.imageUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Image posts need an uploaded image",
        path: ["imageUrl"]
      });
    }
  });

export const voteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)])
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(2000, "Comment is too long")
});
