import {
  users,
  orders,
  messages,
  orderStatusHistory,
  heroContent,
  aboutUs,
  companies,
  socialMediaLinks,
  termsPolicy,
  type User,
  type UpsertUser,
  type Order,
  type InsertOrder,
  type Message,
  type InsertMessage,
  type OrderStatusHistory,
  type InsertOrderStatusHistory,
  type HeroContent,
  type InsertHeroContent,
  type AboutUs,
  type InsertAboutUs,
  type Company,
  type InsertCompany,
  type SocialMediaLink,
  type InsertSocialMediaLink,
  type TermsPolicy,
  type InsertTermsPolicy,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getPendingVerifications(): Promise<User[]>;
  updateUserVerification(userId: string, status: string): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getEmployeeOrders(employeeId: string): Promise<Order[]>;
  getPendingOrders(): Promise<Order[]>;
  getApprovedOrders(): Promise<Order[]>;
  getDeclinedOrders(userId: string): Promise<Order[]>;
  approveOrder(orderId: string, approvedBy: string, assignedEmployeeId?: string): Promise<Order>;
  declineOrder(orderId: string, declinedBy: string, reason: string): Promise<Order>;
  updateOrderStage(orderId: string, stage: string, updatedBy: string, note?: string): Promise<Order>;
  assignOrderToEmployee(orderId: string, employeeId: string): Promise<Order>;
  updateOrderInternalNotes(orderId: string, notes: string): Promise<Order>;
  
  // Order status history
  createOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getOrderMessages(orderId: string): Promise<Message[]>;
  getEmployeeAdminMessages(userId1: string, userId2?: string): Promise<Message[]>;
  markMessagesAsRead(messageIds: string[]): Promise<void>;
  getUserUnreadCount(userId: string): Promise<number>;
  
  // Homepage content management (Super Admin)
  getHeroContent(): Promise<HeroContent[]>;
  upsertHeroContent(content: InsertHeroContent): Promise<HeroContent>;
  deleteHeroContent(id: string): Promise<void>;
  
  getAboutUs(): Promise<AboutUs | undefined>;
  upsertAboutUs(content: InsertAboutUs): Promise<AboutUs>;
  
  getCompanies(): Promise<Company[]>;
  upsertCompany(company: InsertCompany): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  
  getSocialMediaLinks(): Promise<SocialMediaLink[]>;
  upsertSocialMediaLink(link: InsertSocialMediaLink): Promise<SocialMediaLink>;
  deleteSocialMediaLink(id: string): Promise<void>;
  
  getTermsPolicy(type: string): Promise<TermsPolicy | undefined>;
  upsertTermsPolicy(policy: InsertTermsPolicy): Promise<TermsPolicy>;
}

export class DatabaseStorage implements IStorage {
  // ============================================
  // USER OPERATIONS
  // ============================================
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }
  
  async getPendingVerifications(): Promise<User[]> {
    return db.select().from(users).where(eq(users.verificationStatus, "pending"));
  }
  
  async updateUserVerification(userId: string, status: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ verificationStatus: status, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // ============================================
  // ORDER OPERATIONS
  // ============================================
  
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values({
      ...orderData,
      status: "pending",
    }).returning();
    
    // Create initial status history
    await this.createOrderStatusHistory({
      orderId: order.id,
      stage: "pending",
      note: "Order submitted",
    });
    
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  
  async getEmployeeOrders(employeeId: string): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.assignedEmployeeId, employeeId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getPendingOrders(): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.status, "pending"))
      .orderBy(desc(orders.createdAt));
  }
  
  async getApprovedOrders(): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.status, "approved"))
      .orderBy(desc(orders.createdAt));
  }
  
  async getDeclinedOrders(userId: string): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        eq(orders.status, "declined")
      ))
      .orderBy(desc(orders.createdAt));
  }
  
  async approveOrder(orderId: string, approvedBy: string, assignedEmployeeId?: string): Promise<Order> {
    const updateData: any = {
      status: "approved",
      approvedBy,
      updatedAt: new Date(),
    };
    
    if (assignedEmployeeId) {
      updateData.assignedEmployeeId = assignedEmployeeId;
    }
    
    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
      
    await this.createOrderStatusHistory({
      orderId,
      stage: "approved",
      note: "Order approved",
      updatedBy: approvedBy,
    });
    
    return order;
  }
  
  async declineOrder(orderId: string, declinedBy: string, reason: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        status: "declined",
        declinedBy,
        declineReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
      
    await this.createOrderStatusHistory({
      orderId,
      stage: "declined",
      note: `Declined: ${reason}`,
      updatedBy: declinedBy,
    });
    
    return order;
  }
  
  async updateOrderStage(orderId: string, stage: string, updatedBy: string, note?: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        orderStage: stage,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
      
    await this.createOrderStatusHistory({
      orderId,
      stage,
      note: note || `Stage updated to ${stage}`,
      updatedBy,
    });
    
    return order;
  }
  
  async assignOrderToEmployee(orderId: string, employeeId: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        assignedEmployeeId: employeeId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }
  
  async updateOrderInternalNotes(orderId: string, notes: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        internalNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  // ============================================
  // ORDER STATUS HISTORY
  // ============================================
  
  async createOrderStatusHistory(historyData: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const [history] = await db.insert(orderStatusHistory).values(historyData).returning();
    return history;
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.createdAt));
  }

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getOrderMessages(orderId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(and(
        eq(messages.orderId, orderId),
        eq(messages.conversationType, "user_order")
      ))
      .orderBy(messages.createdAt);
  }
  
  async getEmployeeAdminMessages(userId1: string, userId2?: string): Promise<Message[]> {
    const conditions: any[] = [eq(messages.conversationType, "employee_admin")];
    
    if (userId2) {
      conditions.push(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId!, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId!, userId1))
        )
      );
    } else {
      conditions.push(
        or(eq(messages.senderId, userId1), eq(messages.receiverId!, userId1))
      );
    }
    
    return db
      .select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(messages.createdAt);
  }
  
  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    
    await db
      .update(messages)
      .set({ isRead: true })
      .where(inArray(messages.id, messageIds));
  }
  
  async getUserUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(messages)
      .where(and(
        eq(messages.receiverId!, userId),
        eq(messages.isRead, false)
      ));
    return result.length;
  }

  // ============================================
  // HOMEPAGE CONTENT MANAGEMENT (SUPER ADMIN)
  // ============================================
  
  async getHeroContent(): Promise<HeroContent[]> {
    return db
      .select()
      .from(heroContent)
      .where(eq(heroContent.isActive, true))
      .orderBy(heroContent.displayOrder);
  }
  
  async upsertHeroContent(contentData: InsertHeroContent): Promise<HeroContent> {
    if ('id' in contentData && contentData.id) {
      const [content] = await db
        .update(heroContent)
        .set({ ...contentData, updatedAt: new Date() })
        .where(eq(heroContent.id, contentData.id))
        .returning();
      return content;
    } else {
      const [content] = await db.insert(heroContent).values(contentData).returning();
      return content;
    }
  }
  
  async deleteHeroContent(id: string): Promise<void> {
    await db.delete(heroContent).where(eq(heroContent.id, id));
  }
  
  async getAboutUs(): Promise<AboutUs | undefined> {
    const [content] = await db.select().from(aboutUs).limit(1);
    return content;
  }
  
  async upsertAboutUs(contentData: InsertAboutUs): Promise<AboutUs> {
    const existing = await this.getAboutUs();
    
    if (existing) {
      const [content] = await db
        .update(aboutUs)
        .set({ ...contentData, updatedAt: new Date() })
        .where(eq(aboutUs.id, existing.id))
        .returning();
      return content;
    } else {
      const [content] = await db.insert(aboutUs).values(contentData).returning();
      return content;
    }
  }
  
  async getCompanies(): Promise<Company[]> {
    return db
      .select()
      .from(companies)
      .where(eq(companies.isActive, true))
      .orderBy(companies.displayOrder);
  }
  
  async upsertCompany(companyData: InsertCompany): Promise<Company> {
    if ('id' in companyData && companyData.id) {
      const [company] = await db
        .update(companies)
        .set(companyData)
        .where(eq(companies.id, companyData.id))
        .returning();
      return company;
    } else {
      const [company] = await db.insert(companies).values(companyData).returning();
      return company;
    }
  }
  
  async deleteCompany(id: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }
  
  async getSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return db
      .select()
      .from(socialMediaLinks)
      .where(eq(socialMediaLinks.isActive, true))
      .orderBy(socialMediaLinks.displayOrder);
  }
  
  async upsertSocialMediaLink(linkData: InsertSocialMediaLink): Promise<SocialMediaLink> {
    if ('id' in linkData && linkData.id) {
      const [link] = await db
        .update(socialMediaLinks)
        .set(linkData)
        .where(eq(socialMediaLinks.id, linkData.id))
        .returning();
      return link;
    } else {
      const [link] = await db.insert(socialMediaLinks).values(linkData).returning();
      return link;
    }
  }
  
  async deleteSocialMediaLink(id: string): Promise<void> {
    await db.delete(socialMediaLinks).where(eq(socialMediaLinks.id, id));
  }
  
  async getTermsPolicy(type: string): Promise<TermsPolicy | undefined> {
    const [policy] = await db
      .select()
      .from(termsPolicy)
      .where(eq(termsPolicy.type, type))
      .limit(1);
    return policy;
  }
  
  async upsertTermsPolicy(policyData: InsertTermsPolicy): Promise<TermsPolicy> {
    const existing = await this.getTermsPolicy(policyData.type);
    
    if (existing) {
      const [policy] = await db
        .update(termsPolicy)
        .set({ ...policyData, updatedAt: new Date() })
        .where(eq(termsPolicy.id, existing.id))
        .returning();
      return policy;
    } else {
      const [policy] = await db.insert(termsPolicy).values(policyData).returning();
      return policy;
    }
  }
}

export const storage = new DatabaseStorage();
