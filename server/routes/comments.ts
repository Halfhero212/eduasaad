import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";

export function registerCommentRoutes(app: Express) {
  // Get comments for a lesson
  app.get("/api/lessons/:lessonId/comments", requireAuth, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const comments = await storage.getLessonComments(lessonId);

      // Enrich with user info
      const enrichedComments = await Promise.all(
        comments.map(async (comment: any) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: user ? { id: user.id, fullName: user.fullName, role: user.role } : null,
          };
        })
      );

      res.json({ success: true, comments: enrichedComments });
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ error: "Failed to get comments" });
    }
  });

  // Post comment on lesson (students only)
  app.post("/api/lessons/:lessonId/comments", requireAuth, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const { comment: commentText } = req.body;

      if (!commentText || commentText.trim() === "") {
        return res.status(400).json({ error: "Comment cannot be empty" });
      }

      const lesson = await storage.getCourseLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const comment = await storage.createLessonComment({
        lessonId,
        userId: req.user!.id,
        content: commentText,
        parentCommentId: null,
      });

      // Create notification for teacher with courseId and lessonId in message
      await storage.createNotification({
        userId: course.teacherId,
        type: "new_question",
        title: "New Question",
        message: `${req.user!.fullName} asked a question on "${lesson.title}" (Click to view)`,
        relatedId: course.id, // Store course ID for navigation
      });

      res.json({ success: true, commentId: comment.id, message: "Question posted successfully" });
    } catch (error) {
      console.error("Post comment error:", error);
      res.status(500).json({ error: "Failed to post comment" });
    }
  });

  // Reply to comment (teachers only, own courses)
  app.post("/api/comments/:commentId/reply", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const parentCommentId = parseInt(req.params.commentId);
      const { comment: replyText } = req.body;

      if (!replyText || replyText.trim() === "") {
        return res.status(400).json({ error: "Reply cannot be empty" });
      }

      const parentComment = await storage.getLessonComment(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const lesson = await storage.getCourseLesson(parentComment.lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (course && course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only reply to questions on your own courses" });
      }

      const reply = await storage.createLessonComment({
        lessonId: parentComment.lessonId,
        userId: req.user!.id,
        content: replyText,
        parentCommentId,
      });

      // Create notification for student who asked the question
      const notifCourse = await storage.getCourse(lesson.courseId);
      await storage.createNotification({
        userId: parentComment.userId,
        type: "reply",
        title: "Teacher Replied",
        message: `${req.user!.fullName} replied to your question on "${lesson.title}"`,
        relatedId: notifCourse?.id || lesson.courseId, // Store course ID for navigation
      });

      res.json({ success: true, replyId: reply.id, message: "Reply posted successfully" });
    } catch (error) {
      console.error("Reply error:", error);
      res.status(500).json({ error: "Failed to post reply" });
    }
  });
}
