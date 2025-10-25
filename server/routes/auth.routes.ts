import { Router } from "express";
import { z } from "zod";
import { generateToken, hashPassword, comparePassword, isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await storage.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: "user",
      verificationStatus: "pending",
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        verificationStatus: user.verificationStatus,
        profileImageUrl: user.profileImageUrl,
        idPhotoPath: user.idPhotoPath,
        selfiePath: user.selfiePath,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user by email
    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        verificationStatus: user.verificationStatus,
        profileImageUrl: user.profileImageUrl,
        idPhotoPath: user.idPhotoPath,
        selfiePath: user.selfiePath,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Get current user
router.get("/user", isAuthenticated, async (req, res) => {
  const user = req.user as any;
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    verificationStatus: user.verificationStatus,
    profileImageUrl: user.profileImageUrl,
    idPhotoPath: user.idPhotoPath,
    selfiePath: user.selfiePath,
  });
});

// Logout (client-side will remove token)
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
