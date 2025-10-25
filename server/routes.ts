import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, hasRole, isVerified } from "./auth";
import authRoutes from "./routes/auth.routes";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import sharp from "sharp";

// ============================================
// FILE UPLOAD CONFIGURATIONS
// ============================================

// Screenshot upload (≤150 KB)
const screenshotUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/screenshots/");
    },
    filename: (req, file, cb) => {
      const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 150 * 1024, // 150KB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Verification documents upload (≤2 MB)
const verificationUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/verification/");
    },
    filename: (req, file, cb) => {
      const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Chat media upload (images ≤150KB, videos ≤2MB)
const chatMediaUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.mimetype.startsWith("video/") ? "uploads/videos/" : "uploads/chat/";
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max (covers both images and videos)
  },
  fileFilter: (req, file, cb) => {
    // Additional size check for images in fileFilter
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

// Photo compressor upload (≤15 MB)
const compressorUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ============================================
// ROUTE REGISTRATION
// ============================================

export async function registerRoutes(app: Express): Promise<Server> {
  // Register auth routes (login, register, etc.)
  app.use("/api/auth", authRoutes);
  
  // Create upload directories
  await fs.mkdir("uploads/screenshots", { recursive: true });
  await fs.mkdir("uploads/verification", { recursive: true });
  await fs.mkdir("uploads/chat", { recursive: true });
  await fs.mkdir("uploads/videos", { recursive: true });
  await fs.mkdir("uploads/hero", { recursive: true });
  await fs.mkdir("uploads/companies", { recursive: true });
  await fs.mkdir("uploads/social", { recursive: true });


  // ============================================
  // USER VERIFICATION ROUTES
  // ============================================
  
  app.post("/api/verification/upload", isAuthenticated, verificationUpload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "selfie", maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.idPhoto || !files.selfie) {
        return res.status(400).json({ message: "Both ID photo and selfie are required" });
      }

      const idPhotoPath = `/uploads/verification/${files.idPhoto[0].filename}`;
      const selfiePath = `/uploads/verification/${files.selfie[0].filename}`;

      await storage.upsertUser({
        id: userId,
        idPhotoPath,
        selfiePath,
        verificationStatus: "pending",
      });

      res.json({ message: "Verification documents uploaded successfully" });
    } catch (error) {
      console.error("Error uploading verification:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  });

  // ============================================
  // ORDER ROUTES (USERS)
  // ============================================
  
  app.post("/api/orders", isAuthenticated, isVerified, screenshotUpload.single("screenshot"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productLink, productName, quantity, variation, specifications, notes, shippingAddress } = req.body;

      const orderData: any = {
        userId,
        productLink,
        productName,
        quantity: parseInt(quantity) || 1,
        variation: variation || null,
        specifications: specifications || null,
        notes: notes || null,
        shippingAddress,
      };

      if (req.file) {
        orderData.screenshotPath = `/uploads/screenshots/${req.file.filename}`;
      }

      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order: " + error.message });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const order = await storage.getOrder(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check access: owner, assigned employee, or admin/super_admin
      const hasAccess = 
        order.userId === userId || 
        order.assignedEmployeeId === userId ||
        ["admin", "super_admin"].includes(user?.role || "");

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // ============================================
  // EMPLOYEE ROUTES
  // ============================================
  
  app.get("/api/employee/orders", isAuthenticated, hasRole("employee", "admin", "super_admin"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      let orders;
      if (["admin", "super_admin"].includes(user?.role || "")) {
        orders = await storage.getAllOrders();
      } else {
        orders = await storage.getEmployeeOrders(userId);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching employee orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/employee/orders/:id/approve", isAuthenticated, hasRole("employee", "admin", "super_admin"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { assignedEmployeeId } = req.body;
      
      const order = await storage.approveOrder(req.params.id, userId, assignedEmployeeId);
      res.json(order);
    } catch (error) {
      console.error("Error approving order:", error);
      res.status(500).json({ message: "Failed to approve order" });
    }
  });

  app.post("/api/employee/orders/:id/decline", isAuthenticated, hasRole("employee", "admin", "super_admin"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Decline reason is required" });
      }
      
      const order = await storage.declineOrder(req.params.id, userId, reason);
      res.json(order);
    } catch (error) {
      console.error("Error declining order:", error);
      res.status(500).json({ message: "Failed to decline order" });
    }
  });

  app.patch("/api/employee/orders/:id/stage", isAuthenticated, hasRole("employee", "admin", "super_admin"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { stage, note } = req.body;
      
      const validStages = ["purchased_from_china", "in_warehouse", "in_ship", "in_rwanda", "delivered"];
      if (!validStages.includes(stage)) {
        return res.status(400).json({ message: "Invalid stage" });
      }
      
      const order = await storage.updateOrderStage(req.params.id, stage, userId, note);
      res.json(order);
    } catch (error) {
      console.error("Error updating order stage:", error);
      res.status(500).json({ message: "Failed to update stage" });
    }
  });

  app.patch("/api/employee/orders/:id/notes", isAuthenticated, hasRole("employee", "admin", "super_admin"), async (req: any, res) => {
    try {
      const { notes } = req.body;
      const order = await storage.updateOrderInternalNotes(req.params.id, notes);
      res.json(order);
    } catch (error) {
      console.error("Error updating notes:", error);
      res.status(500).json({ message: "Failed to update notes" });
    }
  });

  // ============================================
  // ADMIN ROUTES
  // ============================================
  
  app.get("/api/admin/users", isAuthenticated, hasRole("admin", "super_admin"), async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/verification/pending", isAuthenticated, hasRole("admin", "super_admin"), async (req: any, res) => {
    try {
      const users = await storage.getPendingVerifications();
      res.json(users);
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      res.status(500).json({ message: "Failed to fetch verifications" });
    }
  });

  app.post("/api/admin/users/:id/verify", isAuthenticated, hasRole("admin", "super_admin"), async (req: any, res) => {
    try {
      const { status } = req.body; // "verified" or "rejected"
      
      if (!["verified", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const user = await storage.updateUserVerification(req.params.id, status);
      res.json(user);
    } catch (error) {
      console.error("Error updating verification:", error);
      res.status(500).json({ message: "Failed to update verification" });
    }
  });

  app.get("/api/admin/orders", isAuthenticated, hasRole("admin", "super_admin"), async (req: any, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/assign", isAuthenticated, hasRole("admin", "super_admin"), async (req: any, res) => {
    try {
      const { employeeId } = req.body;
      const order = await storage.assignOrderToEmployee(req.params.id, employeeId);
      res.json(order);
    } catch (error) {
      console.error("Error assigning order:", error);
      res.status(500).json({ message: "Failed to assign order" });
    }
  });

  // ============================================
  // SUPER ADMIN ROUTES - HOMEPAGE MANAGEMENT
  // ============================================
  
  // Hero Content
  app.get("/api/super-admin/hero", async (req, res) => {
    try {
      const content = await storage.getHeroContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching hero content:", error);
      res.status(500).json({ message: "Failed to fetch hero content" });
    }
  });

  app.post("/api/super-admin/hero", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      const content = await storage.upsertHeroContent(req.body);
      res.json(content);
    } catch (error) {
      console.error("Error saving hero content:", error);
      res.status(500).json({ message: "Failed to save hero content" });
    }
  });

  app.delete("/api/super-admin/hero/:id", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      await storage.deleteHeroContent(req.params.id);
      res.json({ message: "Hero content deleted" });
    } catch (error) {
      console.error("Error deleting hero content:", error);
      res.status(500).json({ message: "Failed to delete hero content" });
    }
  });

  // About Us
  app.get("/api/about", async (req, res) => {
    try {
      const content = await storage.getAboutUs();
      res.json(content);
    } catch (error) {
      console.error("Error fetching about us:", error);
      res.status(500).json({ message: "Failed to fetch about us" });
    }
  });

  app.post("/api/super-admin/about", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      const content = await storage.upsertAboutUs(req.body);
      res.json(content);
    } catch (error) {
      console.error("Error saving about us:", error);
      res.status(500).json({ message: "Failed to save about us" });
    }
  });

  // Companies
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post("/api/super-admin/companies", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      const company = await storage.upsertCompany(req.body);
      res.json(company);
    } catch (error) {
      console.error("Error saving company:", error);
      res.status(500).json({ message: "Failed to save company" });
    }
  });

  app.delete("/api/super-admin/companies/:id", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      await storage.deleteCompany(req.params.id);
      res.json({ message: "Company deleted" });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Social Media Links
  app.get("/api/social-links", async (req, res) => {
    try {
      const links = await storage.getSocialMediaLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching social links:", error);
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });

  app.post("/api/super-admin/social-links", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      const link = await storage.upsertSocialMediaLink(req.body);
      res.json(link);
    } catch (error) {
      console.error("Error saving social link:", error);
      res.status(500).json({ message: "Failed to save social link" });
    }
  });

  app.delete("/api/super-admin/social-links/:id", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      await storage.deleteSocialMediaLink(req.params.id);
      res.json({ message: "Social link deleted" });
    } catch (error) {
      console.error("Error deleting social link:", error);
      res.status(500).json({ message: "Failed to delete social link" });
    }
  });

  // Terms & Privacy Policy
  app.get("/api/terms/:type", async (req, res) => {
    try {
      const policy = await storage.getTermsPolicy(req.params.type);
      res.json(policy);
    } catch (error) {
      console.error("Error fetching policy:", error);
      res.status(500).json({ message: "Failed to fetch policy" });
    }
  });

  app.post("/api/super-admin/terms", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      const policy = await storage.upsertTermsPolicy(req.body);
      res.json(policy);
    } catch (error) {
      console.error("Error saving policy:", error);
      res.status(500).json({ message: "Failed to save policy" });
    }
  });

  // User Role Management
  app.patch("/api/super-admin/users/:id/role", isAuthenticated, hasRole("super_admin"), async (req: any, res) => {
    try {
      const { role } = req.body;
      const validRoles = ["user", "employee", "admin", "super_admin"];
      
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // ============================================
  // MESSAGE ROUTES
  // ============================================
  
  app.post("/api/messages", isAuthenticated, chatMediaUpload.single("media"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { orderId, content, conversationType, receiverId } = req.body;
      
      const messageData: any = {
        senderId: userId,
        content,
        conversationType: conversationType || "user_order",
      };
      
      if (orderId) {
        messageData.orderId = orderId;
      }
      
      if (receiverId) {
        messageData.receiverId = receiverId;
      }
      
      if (req.file) {
        messageData.mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
        const folder = req.file.mimetype.startsWith("video/") ? "videos" : "chat";
        messageData.mediaPath = `/uploads/${folder}/${req.file.filename}`;
      }

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get("/api/messages/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const { orderId } = req.params;

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check access: owner, assigned employee, or admin/super_admin
      const hasAccess = 
        order.userId === userId || 
        order.assignedEmployeeId === userId ||
        ["admin", "super_admin", "employee"].includes(user?.role || "");

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const messages = await storage.getOrderMessages(orderId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/employee-admin/:userId?", isAuthenticated, hasRole("employee", "admin", "super_admin"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { userId: targetUserId } = req.params;
      
      const messages = await storage.getEmployeeAdminMessages(userId, targetUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching employee-admin messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // ============================================
  // PHOTO COMPRESSOR
  // ============================================
  
  app.post("/api/compress-photo", compressorUpload.single("photo"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Compress image to 100-150KB range
      const compressed = await sharp(req.file.buffer)
        .resize(1920, 1920, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          progressive: true,
        })
        .toBuffer();

      // Check size and adjust quality if needed
      let quality = 80;
      let result = compressed;
      
      while (result.length > 150 * 1024 && quality > 20) {
        quality -= 10;
        result = await sharp(req.file.buffer)
          .resize(1920, 1920, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({
            quality,
            progressive: true,
          })
          .toBuffer();
      }

      // Send as downloadable file
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Content-Disposition", `attachment; filename="compressed-${Date.now()}.jpg"`);
      res.send(result);
    } catch (error) {
      console.error("Error compressing photo:", error);
      res.status(500).json({ message: "Failed to compress photo" });
    }
  });

  // ============================================
  // SERVE UPLOADED FILES
  // ============================================
  
  const express = await import("express");
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}
