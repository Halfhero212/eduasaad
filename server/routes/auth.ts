import type { Express } from "express";
import { storage } from "../storage";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateToken, requireAuth, requireRole, type AuthRequest } from "../middleware/auth";

export function registerAuthRoutes(app: Express) {
  // Student registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, whatsappNumber } = req.body;

      if (!email || !password || !fullName || !whatsappNumber) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate WhatsApp number length (minimum 10 digits)
      const digitsOnly = whatsappNumber.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        return res.status(400).json({ error: "WhatsApp number must be at least 10 digits", code: "auth.phone_min_length" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create student user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        role: "student",
        whatsappNumber,
      });

      const token = generateToken(user);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Superadmin creates teacher account
  app.post("/api/auth/create-teacher", requireAuth, requireRole("superadmin"), async (req: AuthRequest, res) => {
    try {
      const { email, fullName } = req.body;

      if (!email || !fullName) {
        return res.status(400).json({ error: "Email and full name are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Generate random password
      const password = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create teacher user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        role: "teacher",
      });

      res.json({
        success: true,
        teacher: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        password, // Send back to superadmin to give to teacher
      });
    } catch (error) {
      console.error("Create teacher error:", error);
      res.status(500).json({ error: "Failed to create teacher account" });
    }
  });

  // Request password reset
  app.post("/api/auth/request-reset", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return res.json({ 
          success: true, 
          message: "If an account exists with this email, you will receive reset instructions" 
        });
      }

      // Generate random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // TODO: Send email with reset link
      // For now, we'll just return success
      // In production, integrate with email service (e.g., Resend, SendGrid)
      // const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
      // await sendEmail(user.email, "Password Reset", resetLink);

      res.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive reset instructions",
        // In development, return token for testing
        ...(process.env.NODE_ENV === "development" && { token })
      });
    } catch (error) {
      console.error("Request password reset error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Get token from database
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      // Check if token is expired
      if (new Date() > new Date(resetToken.expiresAt)) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ error: "Reset token has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      await storage.updateUser(resetToken.userId, { password: hashedPassword });

      // Delete used token
      await storage.deletePasswordResetToken(token);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
}

function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
