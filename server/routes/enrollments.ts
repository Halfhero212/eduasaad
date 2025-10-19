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

      // Allow teachers to access their own course lessons
      if (req.user?.role === "teacher") {
        if (course?.teacherId !== req.user.id) {
          return res.status(403).json({ error: "You can only access lessons from your own courses" });
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

  // Get pending enrollments for teacher's courses
  app.get("/api/enrollments/teacher/pending", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const teacherId = req.user!.id;
      
      // Get all courses by this teacher
      const teacherCourses = await storage.getCoursesByTeacher(teacherId);
      const courseIds = teacherCourses.map((c: any) => c.id);

      // Get pending enrollments for these courses
      const pendingEnrollments = await storage.getPendingEnrollmentsForCourses(courseIds);

      // Enrich with student and course info
      const enrichedEnrollments = await Promise.all(
        pendingEnrollments.map(async (enrollment: any) => {
          const student = await storage.getUser(enrollment.studentId);
          const course = await storage.getCourse(enrollment.courseId);
          
          return {
            id: enrollment.id,
            enrolledAt: enrollment.enrolledAt,
            purchaseStatus: enrollment.purchaseStatus,
            student: student ? { id: student.id, fullName: student.fullName, email: student.email } : null,
            course: course ? { id: course.id, title: course.title, price: course.price } : null,
          };
        })
      );

      res.json({ success: true, enrollments: enrichedEnrollments });
    } catch (error) {
      console.error("Get pending enrollments error:", error);
      res.status(500).json({ error: "Failed to get pending enrollments" });
    }
  });

  // Update enrollment status (teacher can confirm their own course enrollments)
  app.put("/api/enrollments/:id/status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !["confirmed", "pending"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      const course = await storage.getCourse(enrollment.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check permissions: teacher can only confirm their own courses, superadmin can confirm any
      if (req.user?.role === "teacher" && course.teacherId !== req.user.id) {
        return res.status(403).json({ error: "You can only manage enrollments for your own courses" });
      } else if (req.user?.role !== "teacher" && req.user?.role !== "superadmin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await storage.updateEnrollmentStatus(enrollmentId, status);

      // Create notification for student
      if (status === "confirmed") {
        await storage.createNotification({
          userId: enrollment.studentId,
          type: "enrollment_confirmed",
          title: "Enrollment Confirmed",
          message: `Your enrollment in "${course.title}" has been confirmed. You can now access all lessons.`,
          read: false,
          relatedId: course.id,
        });
      }

      res.json({ success: true, message: "Enrollment status updated" });
    } catch (error) {
      console.error("Update enrollment status error:", error);
      res.status(500).json({ error: "Failed to update enrollment status" });
    }
  });
}
