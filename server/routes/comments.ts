import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";
import { notificationMessages } from "../utils/notificationMessages";

export function registerCommentRoutes(app: Express) {
  // Get comments for a lesson
  app.get("/api/lessons/:lessonId/comments", requireAuth, async (req: AuthRequest, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const currentUserId = req.user!.id;
      const currentUserRole = req.user!.role;
      
      let comments = await storage.getLessonComments(lessonId);

      // Filter comments based on user role
      if (currentUserRole === "student") {
        // Students see only their own questions and replies to their questions
        const studentCommentIds = new Set(
          comments
            .filter((c: any) => c.userId === currentUserId && c.parentCommentId === null)
            .map((c: any) => c.id)
        );

        comments = comments.filter((c: any) => 
          // Their own questions
          c.userId === currentUserId || 
          // Replies to their questions
          (c.parentCommentId !== null && studentCommentIds.has(c.parentCommentId))
        );
      }
      // Teachers and superadmins see all comments

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

      // Create notification for teacher with navigation metadata (in Arabic)
      await storage.createNotification({
        userId: course.teacherId,
        type: "new_question",
        title: notificationMessages.question.new.title,
        message: notificationMessages.question.new.message(req.user!.fullName, lesson.title),
        relatedId: lessonId,
        metadata: JSON.stringify({ courseId: lesson.courseId, lessonId }),
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
      await storage.createNotification({
        userId: parentComment.userId,
        type: "reply",
        title: notificationMessages.question.teacherReply.title,
        message: notificationMessages.question.teacherReply.message(req.user!.fullName, lesson.title),
        relatedId: parentComment.lessonId,
        metadata: JSON.stringify({ courseId: lesson.courseId, lessonId: parentComment.lessonId }),
      });

      res.json({ success: true, replyId: reply.id, message: "Reply posted successfully" });
    } catch (error) {
      console.error("Reply error:", error);
      res.status(500).json({ error: "Failed to post reply" });
    }
  });
}
