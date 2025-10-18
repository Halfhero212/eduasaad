import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthRequest } from "../middleware/auth";

export function registerNotificationRoutes(app: Express) {
  // Get user's notifications
  app.get("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);

      res.json({ success: true, notifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      await storage.markNotificationAsRead(notificationId);

      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // Mark all notifications as read
  app.put("/api/notifications/read-all", requireAuth, async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);

      for (const notification of notifications) {
        if (!notification.read) {
          await storage.markNotificationAsRead(notification.id);
        }
      }

      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all as read error:", error);
      res.status(500).json({ error: "Failed to update notifications" });
    }
  });
}
