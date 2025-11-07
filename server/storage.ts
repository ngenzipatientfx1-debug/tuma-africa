import { prisma } from "./db";
import type { Prisma, User, Order, OrderStatusHistory, Message, HeroContent, AboutUs, Company, SocialMediaLink, TermsPolicy } from "@prisma/client";

// Type definitions for insert operations (using Unchecked for scalar FK support)
export type UpsertUser = Prisma.UserUncheckedCreateInput;
export type InsertOrder = Prisma.OrderUncheckedCreateInput;
export type InsertOrderStatusHistory = Prisma.OrderStatusHistoryUncheckedCreateInput;
export type InsertMessage = Prisma.MessageUncheckedCreateInput;
export type InsertHeroContent = Prisma.HeroContentUncheckedCreateInput;
export type InsertAboutUs = Prisma.AboutUsUncheckedCreateInput;
export type InsertCompany = Prisma.CompanyUncheckedCreateInput;
export type InsertSocialMediaLink = Prisma.SocialMediaLinkUncheckedCreateInput;
export type InsertTermsPolicy = Prisma.TermsPolicyUncheckedCreateInput;

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
  upsertHeroContent(content: Partial<InsertHeroContent> & { id?: string }): Promise<HeroContent>;
  deleteHeroContent(id: string): Promise<void>;
  
  getAboutUs(): Promise<AboutUs | undefined>;
  upsertAboutUs(content: Partial<InsertAboutUs> & { id?: string }): Promise<AboutUs>;
  
  getCompanies(): Promise<Company[]>;
  upsertCompany(company: Partial<InsertCompany> & { id?: string }): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  
  getSocialMediaLinks(): Promise<SocialMediaLink[]>;
  upsertSocialMediaLink(link: Partial<InsertSocialMediaLink> & { id?: string }): Promise<SocialMediaLink>;
  deleteSocialMediaLink(id: string): Promise<void>;
  
  getTermsPolicy(type: string): Promise<TermsPolicy | undefined>;
  upsertTermsPolicy(policy: Partial<InsertTermsPolicy> & { type: string }): Promise<TermsPolicy>;
}

export class DatabaseStorage implements IStorage {
  // ============================================
  // USER OPERATIONS
  // ============================================
  
  async getUser(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user ?? undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return user ?? undefined;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    return await prisma.user.create({
      data: userData
    });
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required for upsert");
    }
    const { id, ...updateData } = userData;
    return await prisma.user.upsert({
      where: { id },
      update: {
        ...updateData,
        updatedAt: new Date(),
      },
      create: userData
    });
  }
  
  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getPendingVerifications(): Promise<User[]> {
    return await prisma.user.findMany({
      where: { verificationStatus: "pending" }
    });
  }
  
  async updateUserVerification(userId: string, status: string): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { 
        verificationStatus: status,
        updatedAt: new Date()
      }
    });
  }
  
  async updateUserRole(userId: string, role: string): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        updatedAt: new Date()
      }
    });
  }

  // ============================================
  // ORDER OPERATIONS
  // ============================================
  
  async createOrder(orderData: InsertOrder): Promise<Order> {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          ...orderData,
          status: "pending",
        }
      });
      
      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          stage: "pending",
          note: "Order submitted",
        }
      });
      
      return order;
    });
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const order = await prisma.order.findUnique({
      where: { id }
    });
    return order ?? undefined;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getEmployeeOrders(employeeId: string): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { assignedEmployeeId: employeeId },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getPendingOrders(): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getApprovedOrders(): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getDeclinedOrders(userId: string): Promise<Order[]> {
    return await prisma.order.findMany({
      where: {
        userId,
        status: "declined"
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async approveOrder(orderId: string, approvedBy: string, assignedEmployeeId?: string): Promise<Order> {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "approved",
          approvedBy,
          assignedEmployeeId: assignedEmployeeId || undefined,
          updatedAt: new Date(),
        }
      });
      
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          stage: "approved",
          note: "Order approved",
          updatedBy: approvedBy,
        }
      });
      
      return order;
    });
  }
  
  async declineOrder(orderId: string, declinedBy: string, reason: string): Promise<Order> {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "declined",
          declinedBy,
          declineReason: reason,
          updatedAt: new Date(),
        }
      });
      
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          stage: "declined",
          note: `Declined: ${reason}`,
          updatedBy: declinedBy,
        }
      });
      
      return order;
    });
  }
  
  async updateOrderStage(orderId: string, stage: string, updatedBy: string, note?: string): Promise<Order> {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStage: stage,
          updatedAt: new Date(),
        }
      });
      
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          stage,
          note: note || `Stage updated to ${stage}`,
          updatedBy,
        }
      });
      
      return order;
    });
  }
  
  async assignOrderToEmployee(orderId: string, employeeId: string): Promise<Order> {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        assignedEmployeeId: employeeId,
        updatedAt: new Date(),
      }
    });
  }
  
  async updateOrderInternalNotes(orderId: string, notes: string): Promise<Order> {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        internalNotes: notes,
        updatedAt: new Date(),
      }
    });
  }

  // ============================================
  // ORDER STATUS HISTORY
  // ============================================
  
  async createOrderStatusHistory(historyData: Omit<InsertOrderStatusHistory, 'order' | 'updater'> & { orderId: string }): Promise<OrderStatusHistory> {
    return await prisma.orderStatusHistory.create({
      data: historyData
    });
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================
  
  async createMessage(messageData: Omit<InsertMessage, 'sender' | 'order'> & { senderId: string }): Promise<Message> {
    return await prisma.message.create({
      data: messageData
    });
  }

  async getOrderMessages(orderId: string): Promise<Message[]> {
    return await prisma.message.findMany({
      where: {
        orderId,
        conversationType: "user_order"
      },
      orderBy: { createdAt: 'asc' }
    });
  }
  
  async getEmployeeAdminMessages(userId1: string, userId2?: string): Promise<Message[]> {
    const where: Prisma.MessageWhereInput = {
      conversationType: "employee_admin",
    };
    
    if (userId2) {
      where.OR = [
        { AND: [{ senderId: userId1 }, { receiverId: userId2 }] },
        { AND: [{ senderId: userId2 }, { receiverId: userId1 }] }
      ];
    } else {
      where.OR = [
        { senderId: userId1 },
        { receiverId: userId1 }
      ];
    }
    
    return await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
  }
  
  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds }
      },
      data: { isRead: true }
    });
  }
  
  async getUserUnreadCount(userId: string): Promise<number> {
    return await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
  }

  // ============================================
  // HOMEPAGE CONTENT MANAGEMENT (SUPER ADMIN)
  // ============================================
  
  async getHeroContent(): Promise<HeroContent[]> {
    return await prisma.heroContent.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
  }
  
  async upsertHeroContent(contentData: Partial<InsertHeroContent> & { id?: string }): Promise<HeroContent> {
    if (contentData.id) {
      const { id, ...updateData } = contentData;
      return await prisma.heroContent.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });
    } else {
      return await prisma.heroContent.create({
        data: contentData as Prisma.HeroContentCreateInput
      });
    }
  }
  
  async deleteHeroContent(id: string): Promise<void> {
    await prisma.heroContent.delete({
      where: { id }
    });
  }
  
  async getAboutUs(): Promise<AboutUs | undefined> {
    const content = await prisma.aboutUs.findFirst();
    return content ?? undefined;
  }
  
  async upsertAboutUs(contentData: Partial<InsertAboutUs> & { id?: string }): Promise<AboutUs> {
    const existing = await this.getAboutUs();
    
    if (existing) {
      const { id, ...updateData } = contentData;
      return await prisma.aboutUs.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });
    } else {
      return await prisma.aboutUs.create({
        data: contentData as Prisma.AboutUsCreateInput
      });
    }
  }
  
  async getCompanies(): Promise<Company[]> {
    return await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
  }
  
  async upsertCompany(companyData: Partial<InsertCompany> & { id?: string }): Promise<Company> {
    if (companyData.id) {
      const { id, ...updateData } = companyData;
      return await prisma.company.update({
        where: { id },
        data: updateData
      });
    } else {
      return await prisma.company.create({
        data: companyData as Prisma.CompanyCreateInput
      });
    }
  }
  
  async deleteCompany(id: string): Promise<void> {
    await prisma.company.delete({
      where: { id }
    });
  }
  
  async getSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return await prisma.socialMediaLink.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
  }
  
  async upsertSocialMediaLink(linkData: Partial<InsertSocialMediaLink> & { id?: string }): Promise<SocialMediaLink> {
    if (linkData.id) {
      const { id, ...updateData } = linkData;
      return await prisma.socialMediaLink.update({
        where: { id },
        data: updateData
      });
    } else {
      return await prisma.socialMediaLink.create({
        data: linkData as Prisma.SocialMediaLinkCreateInput
      });
    }
  }
  
  async deleteSocialMediaLink(id: string): Promise<void> {
    await prisma.socialMediaLink.delete({
      where: { id }
    });
  }
  
  async getTermsPolicy(type: string): Promise<TermsPolicy | undefined> {
    const policy = await prisma.termsPolicy.findFirst({
      where: { type }
    });
    return policy ?? undefined;
  }
  
  async upsertTermsPolicy(policyData: Partial<InsertTermsPolicy> & { type: string }): Promise<TermsPolicy> {
    const existing = await this.getTermsPolicy(policyData.type);
    
    if (existing) {
      const { id, type, ...updateData } = policyData;
      return await prisma.termsPolicy.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });
    } else {
      return await prisma.termsPolicy.create({
        data: policyData as Prisma.TermsPolicyCreateInput
      });
    }
  }
}

export const storage = new DatabaseStorage();
