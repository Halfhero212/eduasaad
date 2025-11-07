import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";
import { insertCourseCategorySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

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

  // Get all pending enrollments (superadmin only)
  app.get("/api/admin/enrollments/pending", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const allCourses = await storage.getAllCourses();
      const pendingEnrollments = [];

      for (const course of allCourses) {
        const enrollments = await storage.getCourseEnrollments(course.id);
        const pending = enrollments.filter(e => e.purchaseStatus === "pending");
        
        for (const enrollment of pending) {
          const student = await storage.getUserById(enrollment.studentId);
          const teacher = await storage.getUserById(course.teacherId);
          
          pendingEnrollments.push({
            id: enrollment.id,
            student: student ? {
              id: student.id,
              fullName: student.fullName,
              email: student.email,
            } : null,
            course: {
              id: course.id,
              title: course.title,
              price: course.price,
            },
            teacher: teacher ? {
              id: teacher.id,
              fullName: teacher.fullName,
              whatsappNumber: teacher.whatsappNumber,
            } : null,
            enrolledAt: enrollment.enrolledAt,
          });
        }
      }

      res.json({ success: true, enrollments: pendingEnrollments });
    } catch (error) {
      console.error("Get pending enrollments error:", error);
      res.status(500).json({ error: "Failed to get pending enrollments" });
    }
  });

  // Update enrollment status (superadmin only)
  app.put("/api/admin/enrollments/:id/status", requireAuth, requireRole("superadmin"), async (req: AuthRequest, res) => {
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

  // Get all categories (superadmin only)
  app.get("/api/admin/categories", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const categories = await storage.getAllCourseCategories();
      res.json({ success: true, categories });
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Create category (superadmin only)
  app.post("/api/admin/categories", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const result = insertCourseCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const category = await storage.createCourseCategory(result.data);
      res.json({ success: true, category });
    } catch (error: any) {
      console.error("Create category error:", error);
      if (error.message?.includes("unique")) {
        return res.status(400).json({ error: "Category name already exists" });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Update category (superadmin only)
  app.put("/api/admin/categories/:id", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const result = insertCourseCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const category = await storage.updateCourseCategory(categoryId, result.data);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json({ success: true, category });
    } catch (error: any) {
      console.error("Update category error:", error);
      if (error.message?.includes("unique")) {
        return res.status(400).json({ error: "Category name already exists" });
      }
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // Delete category (superadmin only)
  app.delete("/api/admin/categories/:id", requireAuth, requireRole("superadmin"), async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);

      // Check if category has courses
      const courses = await storage.getAllCourses(categoryId);
      if (courses.length > 0) {
        return res.status(400).json({ error: "Cannot delete category with existing courses" });
      }

      await storage.deleteCourseCategory(categoryId);
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });
}
