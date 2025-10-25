import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { type RequestHandler } from "express";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate JWT token
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check for token in Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    // Fetch full user data from database
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Role-based authorization middleware
export function hasRole(...allowedRoles: string[]): RequestHandler {
  return async (req, res, next) => {
    const user = req.user as any;
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
    }

    next();
  };
}

// Verification status check
export const isVerified: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (user.verificationStatus !== "verified") {
    return res.status(403).json({ 
      message: "Account not verified. Please complete verification first.",
      verificationRequired: true
    });
  }

  next();
};
