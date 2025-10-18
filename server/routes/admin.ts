import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";

export function registerAdminRoutes(app: Express) {
  // Get all teachers (superadmin only)
  app.get("/api/admin/teachers", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();

      const enrichedTeachers = await Promise.all(
        teachers.map(async (teacher) => {
          const courses = await storage.getCoursesByTeacher(teacher.id);
          return {
            id: teacher.id,
            email: teacher.email,
            fullName: teacher.fullName,
            role: teacher.role,
            courseCount: courses.length,
          };
        })
      );

      res.json({ success: true, teachers: enrichedTeachers });
    } catch (error) {
      console.error("Get teachers error:", error);
      res.status(500).json({ error: "Failed to get teachers" });
    }
  });

  // Get all students (superadmin only)
  app.get("/api/admin/students", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const students = await storage.getAllStudents();

      const enrichedStudents = await Promise.all(
        students.map(async (student) => {
          const enrollments = await storage.getStudentEnrollments(student.id);
          return {
            id: student.id,
            email: student.email,
            fullName: student.fullName,
            role: student.role,
            enrollmentCount: enrollments.length,
          };
        })
      );

      res.json({ success: true, students: enrichedStudents });
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ error: "Failed to get students" });
    }
  });

  // Get platform stats (superadmin only)
  app.get("/api/admin/stats", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      const students = await storage.getAllStudents();
      const courses = await storage.getAllCourses();
      
      let totalEnrollments = 0;
      for (const course of courses) {
        const enrollments = await storage.getCourseEnrollments(course.id);
        totalEnrollments += enrollments.length;
      }

      res.json({
        success: true,
        stats: {
          teacherCount: teachers.length,
          studentCount: students.length,
          courseCount: courses.length,
          enrollmentCount: totalEnrollments,
        },
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Get platform settings (superadmin only)
  app.get("/api/admin/settings", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const settings = await storage.getAllPlatformSettings();

      res.json({ success: true, settings });
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  // Update platform setting (superadmin only)
  app.put("/api/admin/settings/:key", requireAuth, requireRole("superadmin"), async (req: AuthRequest, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;

      if (!value) {
        return res.status(400).json({ error: "Value is required" });
      }

      const updated = await storage.updatePlatformSetting(key, value);

      res.json({ success: true, setting: updated });
    } catch (error) {
      console.error("Update setting error:", error);
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  // Delete teacher (superadmin only)
  app.delete("/api/admin/teachers/:id", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      
      // Check if teacher exists
      const teacher = await storage.getUserById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // Delete the teacher
      await storage.deleteUser(teacherId);

      res.json({ success: true, message: "Teacher deleted successfully" });
    } catch (error) {
      console.error("Delete teacher error:", error);
      res.status(500).json({ error: "Failed to delete teacher" });
    }
  });

  // Delete student (superadmin only)
  app.delete("/api/admin/students/:id", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      
      // Check if student exists
      const student = await storage.getUserById(studentId);
      if (!student || student.role !== "student") {
        return res.status(404).json({ error: "Student not found" });
      }

      // Delete the student
      await storage.deleteUser(studentId);

      res.json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Update enrollment status (superadmin/teacher)
  app.put("/api/admin/enrollments/:id/status", requireAuth, requireRole("superadmin", "teacher"), async (req: AuthRequest, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !["pending", "confirmed", "free"].includes(status)) {
        return res.status(400).json({ error: "Valid status is required (pending/confirmed/free)" });
      }

      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      // If teacher, verify it's their course
      if (req.user!.role === "teacher") {
        const course = await storage.getCourse(enrollment.courseId);
        if (course && course.teacherId !== req.user!.id) {
          return res.status(403).json({ error: "You can only update enrollments for your own courses" });
        }
      }

      const updated = await storage.updateEnrollmentStatus(enrollmentId, status);

      // Notify student if status changed
      if (status === "confirmed") {
        await storage.createNotification({
          userId: enrollment.studentId,
          type: "enrollment_confirmed",
          title: "Enrollment Confirmed",
          message: "Your course enrollment has been confirmed. You can now access all lessons.",
          relatedId: enrollmentId,
        });
      }

      res.json({ success: true, enrollment: updated });
    } catch (error) {
      console.error("Update enrollment status error:", error);
      res.status(500).json({ error: "Failed to update enrollment status" });
    }
  });
}
