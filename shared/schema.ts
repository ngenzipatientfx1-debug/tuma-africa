import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles: user, employee, admin, super_admin
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // Hashed password for authentication
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"), // user, employee, admin, super_admin
  verificationStatus: varchar("verification_status").notNull().default("pending"), // pending, verified, rejected
  idPhotoPath: varchar("id_photo_path"),
  selfiePath: varchar("selfie_path"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  messages: many(messages),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Orders table with full workflow support
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productLink: text("product_link").notNull(),
  productName: text("product_name").notNull(),
  screenshotPath: text("screenshot_path"),
  quantity: integer("quantity").notNull().default(1),
  variation: text("variation"),
  specifications: text("specifications"),
  notes: text("notes"),
  shippingAddress: text("shipping_address").notNull(),
  
  // Status workflow
  status: varchar("status").notNull().default("pending"), // pending, approved, declined
  orderStage: varchar("order_stage"), // purchased_from_china, in_warehouse, in_ship, in_rwanda, delivered
  
  // Approval workflow
  approvedBy: varchar("approved_by").references(() => users.id),
  declinedBy: varchar("declined_by").references(() => users.id),
  declineReason: text("decline_reason"),
  assignedEmployeeId: varchar("assigned_employee_id").references(() => users.id),
  
  // Additional info
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  trackingNumber: varchar("tracking_number"),
  internalNotes: text("internal_notes"), // Only visible to employees and admins
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  statusHistory: many(orderStatusHistory),
  messages: many(messages),
}));

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
  declinedBy: true,
  assignedEmployeeId: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order status history for tracking timeline
export const orderStatusHistory = pgTable("order_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  stage: varchar("stage").notNull(), // purchased_from_china, in_warehouse, in_ship, in_rwanda, delivered
  note: text("note"),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = typeof orderStatusHistory.$inferInsert;

// Messages table for chat/inbox with media support
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").references(() => users.id), // For employee-admin chat
  content: text("content").notNull(),
  mediaType: varchar("media_type").default("text"), // text, image, video, document
  mediaPath: text("media_path"),
  conversationType: varchar("conversation_type").notNull().default("user_order"), // user_order, employee_admin
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [messages.orderId],
    references: [orders.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Hero content management (for Super Admin)
export const heroContent = pgTable("hero_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaType: varchar("media_type").notNull().default("image"), // image, video
  mediaPath: text("media_path").notNull(),
  heading: text("heading").notNull(),
  subheading: text("subheading").notNull(),
  buttonText: text("button_text").notNull(),
  buttonLink: text("button_link").notNull(),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type HeroContent = typeof heroContent.$inferSelect;
export type InsertHeroContent = typeof heroContent.$inferInsert;

// About Us content
export const aboutUs = pgTable("about_us", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  heading: text("heading").notNull(),
  content: text("content").notNull(),
  mediaType: varchar("media_type"), // image, video, null
  mediaPath: text("media_path"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AboutUs = typeof aboutUs.$inferSelect;
export type InsertAboutUs = typeof aboutUs.$inferInsert;

// Companies showcase
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  logoPath: text("logo_path").notNull(),
  url: text("url").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// Social media links
export const socialMediaLinks = pgTable("social_media_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: varchar("platform").notNull(), // facebook, instagram, tiktok, youtube, etc
  iconPath: text("icon_path").notNull(),
  url: text("url").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SocialMediaLink = typeof socialMediaLinks.$inferSelect;
export type InsertSocialMediaLink = typeof socialMediaLinks.$inferInsert;

// Terms and Privacy Policy
export const termsPolicy = pgTable("terms_policy", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // terms, privacy
  title: text("title").notNull(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TermsPolicy = typeof termsPolicy.$inferSelect;
export type InsertTermsPolicy = typeof termsPolicy.$inferInsert;
