import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerAuthRoutes } from "./routes/auth";
import { registerCourseRoutes } from "./routes/courses";
import { registerEnrollmentRoutes } from "./routes/enrollments";
import { registerQuizRoutes } from "./routes/quizzes";
import { registerCommentRoutes } from "./routes/comments";
import { registerNotificationRoutes } from "./routes/notifications";
import { registerAdminRoutes } from "./routes/admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all route modules
  registerAuthRoutes(app);
  registerCourseRoutes(app);
  registerEnrollmentRoutes(app);
  registerQuizRoutes(app);
  registerCommentRoutes(app);
  registerNotificationRoutes(app);
  registerAdminRoutes(app);

  // WhatsApp integration endpoint - get platform WhatsApp number
  app.get("/api/whatsapp-number", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const setting = await storage.getPlatformSetting("whatsapp_number");
      res.json({ success: true, number: setting?.value || "9647801234567" });
    } catch (error) {
      console.error("Get WhatsApp number error:", error);
      res.json({ success: true, number: "9647801234567" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
