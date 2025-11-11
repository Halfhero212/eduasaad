import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";
import multer from "multer";
import { getStorageAdapter } from "../utils/storage-adapter";
import { notificationMessages } from "../utils/notificationMessages";

const upload = multer({ storage: multer.memoryStorage() });

export function registerQuizRoutes(app: Express) {
  // Create quiz (teachers only)
  app.post("/api/quizzes", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const { lessonId, title, description, deadline } = req.body;

      if (!lessonId || !title || !description) {
        return res.status(400).json({ error: "Lesson ID, title, and description are required" });
      }

      // Verify the lesson exists and belongs to teacher's course
      const lesson = await storage.getCourseLesson(parseInt(lessonId));
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (course && course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only create quizzes for your own courses" });
      }

      const quiz = await storage.createQuiz({
        lessonId: parseInt(lessonId),
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
      });

      // Create notifications for all enrolled students (in Arabic)
      const enrollments = await storage.getCourseEnrollments(lesson.courseId);
      for (const enrollment of enrollments) {
        await storage.createNotification({
          userId: enrollment.studentId,
          type: "new_content",
          title: notificationMessages.quiz.newAvailable.title,
          message: notificationMessages.quiz.newAvailable.message(title, course?.title || ""),
          relatedId: quiz.id,
        });
      }

      res.json({ success: true, quizId: quiz.id, message: "Quiz created successfully" });
    } catch (error) {
      console.error("Create quiz error:", error);
      res.status(500).json({ error: "Failed to create quiz" });
    }
  });

  // Get quizzes for a lesson
  app.get("/api/lessons/:lessonId/quizzes", requireAuth, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const quizzes = await storage.getQuizzesByLesson(lessonId);

      res.json({ success: true, quizzes });
    } catch (error) {
      console.error("Get quizzes error:", error);
      res.status(500).json({ error: "Failed to get quizzes" });
    }
  });

  // Submit quiz (students only) with image upload
  app.post("/api/quizzes/:quizId/submit", requireAuth, requireRole("student"), upload.array("images", 5), async (req: AuthRequest, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const quiz = await storage.getQuiz(quizId);

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Check if already submitted
      const existing = await storage.getQuizSubmissionsByQuiz(quizId);
      const alreadySubmitted = existing.find((s) => s.studentId === req.user!.id);
      if (alreadySubmitted) {
        return res.status(400).json({ error: "You have already submitted this quiz" });
      }

      // Upload images to storage
      const files = req.files as Express.Multer.File[];
      const imageUrls: string[] = [];

      if (files && files.length > 0) {
        const storageAdapter = getStorageAdapter();
        for (const file of files) {
          const fileName = `quiz-submissions/${quizId}/${req.user!.id}/${Date.now()}-${file.originalname}`;
          const result = await storageAdapter.uploadFromBytes(fileName, file.buffer);
          if (result.ok) {
            imageUrls.push(storageAdapter.getPublicUrl(fileName));
          }
        }
      }

      const submission = await storage.createQuizSubmission({
        quizId,
        studentId: req.user!.id,
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        score: null,
        feedback: null,
        gradedAt: null,
      });

      // Create notification for teacher
      const lesson = await storage.getCourseLesson(quiz.lessonId);
      if (lesson) {
        const course = await storage.getCourse(lesson.courseId);
        if (course) {
          await storage.createNotification({
            userId: course.teacherId,
            type: "quiz_submission",
            title: notificationMessages.quiz.newSubmission.title,
            message: notificationMessages.quiz.newSubmission.message(req.user!.fullName, quiz.title),
            relatedId: submission.id,
          });
        }
      }

      res.json({ success: true, submissionId: submission.id, message: "Quiz submitted successfully" });
    } catch (error) {
      console.error("Submit quiz error:", error);
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  });

  // Get quiz submissions (teachers see all for their courses, students see their own)
  app.get("/api/quizzes/:quizId/submissions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const quiz = await storage.getQuiz(quizId);

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      let submissions;
      if (req.user!.role === "teacher") {
        // Verify this is teacher's quiz
        const lesson = await storage.getCourseLesson(quiz.lessonId);
        if (!lesson) {
          return res.status(404).json({ error: "Lesson not found" });
        }
        const course = await storage.getCourse(lesson.courseId);
        if (course && course.teacherId !== req.user!.id) {
          return res.status(403).json({ error: "You can only view submissions for your own courses" });
        }

        submissions = await storage.getQuizSubmissionsByQuiz(quizId);
      } else {
        // Students only see their own submissions
        const allSubmissions = await storage.getQuizSubmissionsByQuiz(quizId);
        submissions = allSubmissions.filter((s) => s.studentId === req.user!.id);
      }

      // Enrich with student info
      const enrichedSubmissions = await Promise.all(
        submissions.map(async (submission) => {
          const student = await storage.getUser(submission.studentId);
          return {
            ...submission,
            student: student ? { id: student.id, fullName: student.fullName, email: student.email } : null,
          };
        })
      );

      res.json({ success: true, submissions: enrichedSubmissions });
    } catch (error) {
      console.error("Get submissions error:", error);
      res.status(500).json({ error: "Failed to get submissions" });
    }
  });

  // Grade quiz submission (teachers only)
  app.put("/api/submissions/:submissionId/grade", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const submissionId = parseInt(req.params.submissionId);
      const { score, feedback } = req.body;

      const submission = await storage.getQuizSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      // Verify this is teacher's quiz
      const quiz = await storage.getQuiz(submission.quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      const lesson = await storage.getCourseLesson(quiz.lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (course && course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only grade submissions for your own courses" });
      }

      const updated = await storage.updateQuizSubmission(submissionId, {
        score: score !== undefined ? parseInt(score) : null,
        feedback: feedback || null,
        gradedAt: new Date(),
      });

      // Create notification for student
      await storage.createNotification({
        userId: submission.studentId,
        type: "reply",
        title: notificationMessages.quiz.graded.title,
        message: notificationMessages.quiz.graded.message(quiz.title, score),
        relatedId: submissionId,
      });

      res.json({ success: true, submission: updated });
    } catch (error) {
      console.error("Grade submission error:", error);
      res.status(500).json({ error: "Failed to grade submission" });
    }
  });

  // Update quiz (teachers only, own courses)
  app.put("/api/quizzes/:id", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Verify this is teacher's quiz
      const lesson = await storage.getCourseLesson(quiz.lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (!course || course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only edit your own quizzes" });
      }

      const { title, description, deadline } = req.body;
      const updates: any = {};
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (deadline !== undefined) updates.deadline = deadline ? new Date(deadline) : null;

      await storage.updateQuiz(quizId, updates);

      res.json({ success: true, message: "Quiz updated successfully" });
    } catch (error) {
      console.error("Update quiz error:", error);
      res.status(500).json({ error: "Failed to update quiz" });
    }
  });

  // Delete quiz (teachers only, own courses)
  app.delete("/api/quizzes/:id", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Verify this is teacher's quiz
      const lesson = await storage.getCourseLesson(quiz.lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (!course || course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only delete your own quizzes" });
      }

      await storage.deleteQuiz(quizId);

      res.json({ success: true, message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Delete quiz error:", error);
      res.status(500).json({ error: "Failed to delete quiz" });
    }
  });
}
