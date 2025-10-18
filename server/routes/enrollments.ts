import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";

export function registerEnrollmentRoutes(app: Express) {
  // Enroll in course (students only)
  app.post("/api/courses/:id/enroll", requireAuth, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const studentId = req.user!.id;

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check if already enrolled
      const existing = await storage.getEnrollment(studentId, courseId);
      if (existing) {
        return res.status(400).json({ error: "Already enrolled in this course" });
      }

      // Create enrollment with appropriate status
      const purchaseStatus = course.isFree || course.price === null || course.price === "0" ? "free" : "pending";

      await storage.createEnrollment({
        studentId,
        courseId,
        purchaseStatus,
      });

      res.json({
        success: true,
        message: purchaseStatus === "free" ? "Enrolled successfully" : "Enrollment pending - please contact via WhatsApp to complete payment",
        purchaseStatus,
      });
    } catch (error) {
      console.error("Enrollment error:", error);
      res.status(500).json({ error: "Failed to enroll" });
    }
  });

  // Get student's enrolled courses
  app.get("/api/enrollments/my-courses", requireAuth, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const enrollments = await storage.getStudentEnrollments(req.user!.id);
      
      // Filter to only show confirmed or free courses (exclude pending)
      const accessibleEnrollments = enrollments.filter(
        (e) => e.purchaseStatus === "confirmed" || e.purchaseStatus === "free"
      );

      const enrichedEnrollments = await Promise.all(
        accessibleEnrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          if (!course) return null;

          const teacher = await storage.getUser(course.teacherId);
          const lessons = await storage.getCourseLessons(course.id);
          const progress = await storage.getStudentProgressForCourse(req.user!.id, course.id);

          const completedLessons = progress.filter((p) => p.completed).length;
          const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

          return {
            ...course,
            teacher: teacher ? { id: teacher.id, fullName: teacher.fullName } : null,
            lessonCount: lessons.length,
            completedLessons,
            progress: progressPercentage,
            enrolled: true,
            enrolledAt: enrollment.enrolledAt,
            purchaseStatus: enrollment.purchaseStatus,
          };
        })
      );

      const courses = enrichedEnrollments.filter((c) => c !== null);

      res.json({ success: true, courses });
    } catch (error) {
      console.error("Get enrolled courses error:", error);
      res.status(500).json({ error: "Failed to get enrolled courses" });
    }
  });

  // Update lesson progress
  app.post("/api/lessons/:lessonId/progress", requireAuth, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const { completed, lastPosition } = req.body;

      const progress = await storage.upsertLessonProgress({
        studentId: req.user!.id,
        lessonId,
        completed: completed || false,
        lastPosition: lastPosition || 0,
        completedAt: completed ? new Date() : null,
      });

      res.json({ success: true, progress });
    } catch (error) {
      console.error("Update progress error:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Get lesson progress and details
  app.get("/api/lessons/:lessonId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const lesson = await storage.getCourseLesson(lessonId);

      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      const allLessons = await storage.getCourseLessons(lesson.courseId);

      // Verify enrollment access for students
      if (req.user?.role === "student") {
        const enrollment = await storage.getEnrollment(req.user.id, lesson.courseId);
        
        // Only allow access if enrollment is confirmed or free
        if (!enrollment || (enrollment.purchaseStatus !== "confirmed" && enrollment.purchaseStatus !== "free")) {
          return res.status(403).json({ error: "You must have a confirmed enrollment to access this lesson" });
        }
      }

      let progress = null;
      if (req.user?.role === "student") {
        progress = await storage.getLessonProgress(req.user.id, lessonId);
      }

      res.json({
        success: true,
        lesson,
        course,
        allLessons,
        progress,
      });
    } catch (error) {
      console.error("Get lesson error:", error);
      res.status(500).json({ error: "Failed to get lesson" });
    }
  });
}
