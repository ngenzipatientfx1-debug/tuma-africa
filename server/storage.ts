import {
  users,
  orders,
  messages,
  orderStatusHistory,
  type User,
  type UpsertUser,
  type Order,
  type InsertOrder,
  type Message,
  type InsertMessage,
  type OrderStatusHistory,
  type InsertOrderStatusHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string, trackingNumber?: string | null): Promise<Order>;

  // Order status history
  createOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getOrderMessages(orderId: string): Promise<Message[]>;
  getAllMessagesForUser(userId: string): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  // Order operations
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    
    // Create initial status history
    await this.createOrderStatusHistory({
      orderId: order.id,
      status: order.status,
      note: "Order created",
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

  async updateOrderStatus(
    id: string,
    status: string,
    trackingNumber?: string | null
  ): Promise<Order> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    // Create status history entry
    await this.createOrderStatusHistory({
      orderId: id,
      status,
      note: trackingNumber ? `Tracking number: ${trackingNumber}` : undefined,
    });

    return order;
  }

  // Order status history
  async createOrderStatusHistory(
    historyData: InsertOrderStatusHistory
  ): Promise<OrderStatusHistory> {
    const [history] = await db
      .insert(orderStatusHistory)
      .values(historyData)
      .returning();
    return history;
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(orderStatusHistory.createdAt);
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getOrderMessages(orderId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.orderId, orderId))
      .orderBy(messages.createdAt);
  }

  async getAllMessagesForUser(userId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.senderId, userId))
      .orderBy(desc(messages.createdAt));
  }
}

export const storage = new DatabaseStorage();
