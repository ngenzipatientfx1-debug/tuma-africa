import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Order routes
  app.post("/api/orders", isAuthenticated, upload.single("screenshot"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productLink, quantity, variation, specifications } = req.body;

      const orderData: any = {
        userId,
        productLink,
        quantity: parseInt(quantity) || 1,
        variation: variation || null,
        specifications: specifications || null,
        status: "submitted",
      };

      if (req.file) {
        orderData.screenshotUrl = `/uploads/${req.file.filename}`;
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
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Check if user owns the order or is admin
      if (order.userId !== userId && user?.isAdmin !== 1) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Message routes
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { orderId, content } = req.body;

      // Verify user owns the order OR is admin
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== userId && user?.isAdmin !== 1) {
        return res.status(403).json({ message: "Access denied" });
      }

      const message = await storage.createMessage({
        orderId,
        senderId: userId,
        content,
        isAdminMessage: user?.isAdmin === 1 ? 1 : 0,
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get("/api/messages/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { orderId } = req.params;

      // Verify user owns the order OR is admin
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== userId && user?.isAdmin !== 1) {
        return res.status(403).json({ message: "Access denied" });
      }

      const messages = await storage.getOrderMessages(orderId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Admin middleware
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (user?.isAdmin !== 1) {
        return res.status(403).json({ message: "Admin access required" });
      }

      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  // Admin message endpoint to get all orders for inbox view
  app.get("/api/admin/messages", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Admin routes
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { status, trackingNumber } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status, trackingNumber);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", isAuthenticated, (req, res, next) => {
    // Add authentication check for file access
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
