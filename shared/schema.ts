// Re-export Prisma generated types
export type {
  User,
  Order,
  OrderStatusHistory,
  Message,
  Session,
  HeroContent,
  AboutUs,
  Company,
  SocialMediaLink,
  TermsPolicy,
  Prisma,
} from "@prisma/client";

// Re-export storage types
export type {
  UpsertUser,
  InsertOrder,
  InsertOrderStatusHistory,
  InsertMessage,
  InsertHeroContent,
  InsertAboutUs,
  InsertCompany,
  InsertSocialMediaLink,
  InsertTermsPolicy,
} from "../server/storage";

import { z } from "zod";

// Zod schemas for form validation (replacing drizzle-zod)
export const insertOrderSchema = z.object({
  userId: z.string(),
  productLink: z.string().url("Must be a valid URL"),
  productName: z.string().min(1, "Product name is required"),
  screenshotPath: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  variation: z.string().optional(),
  specifications: z.string().optional(),
  notes: z.string().optional(),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  estimatedCost: z.number().optional(),
  trackingNumber: z.string().optional(),
});

export const insertMessageSchema = z.object({
  orderId: z.string().optional(),
  senderId: z.string(),
  receiverId: z.string().optional(),
  content: z.string().min(1, "Message content is required"),
  mediaType: z.enum(["text", "image", "video", "document"]).default("text"),
  mediaPath: z.string().optional(),
  conversationType: z.enum(["user_order", "employee_admin"]).default("user_order"),
});

export type InsertOrderInput = z.infer<typeof insertOrderSchema>;
export type InsertMessageInput = z.infer<typeof insertMessageSchema>;
