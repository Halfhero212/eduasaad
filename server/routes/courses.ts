import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";

export function registerCourseRoutes(app: Express) {
  // Get all courses (public)
  app.get("/api/courses", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const courses = await storage.getAllCourses(categoryId);

      // Get categories
      const categories = await storage.getAllCourseCategories();

      // Enrich courses with teacher info
      const enrichedCourses = await Promise.all(
        courses.map(async (course) => {
          const teacher = await storage.getUser(course.teacherId);
          const lessons = await storage.getCourseLessons(course.id);
          const enrollments = await storage.getCourseEnrollments(course.id);

          return {
            ...course,
            teacher: teacher ? { id: teacher.id, fullName: teacher.fullName } : null,
            lessonCount: lessons.length,
            enrollmentCount: enrollments.length,
          };
        })
      );

      res.json({ success: true, courses: enrichedCourses, categories });
    } catch (error) {
      console.error("Get courses error:", error);
      res.status(500).json({ error: "Failed to get courses" });
    }
  });

  // Get all categories (must be before /:id route to avoid matching "categories" as id)
  app.get("/api/courses/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCourseCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Get course details
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const teacher = await storage.getUser(course.teacherId);
      const lessons = await storage.getCourseLessons(courseId);
      const enrollments = await storage.getCourseEnrollments(courseId);
      const category = await storage.getCourseCategory(course.categoryId);

      // Check if current user is enrolled (if authenticated)
      let isEnrolled = false;
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        const user = (req as AuthRequest).user;
        if (user?.role === "student") {
          const enrollment = await storage.getEnrollment(user.id, courseId);
          isEnrolled = !!enrollment;
        }
      }

      res.json({
        success: true,
        course: {
          ...course,
          teacher: teacher ? { id: teacher.id, fullName: teacher.fullName, email: teacher.email, whatsappNumber: teacher.whatsappNumber } : null,
          category: category || null,
          lessonCount: lessons.length,
          enrollmentCount: enrollments.length,
        },
        lessons: lessons.map((lesson) => ({
          ...lesson,
          free: false, // Could add a free preview field later
        })),
        isEnrolled,
      });
    } catch (error) {
      console.error("Get course error:", error);
      res.status(500).json({ error: "Failed to get course" });
    }
  });

  // Create course (teachers only)
  app.post("/api/courses", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const { title, description, whatYouWillLearn, categoryId, price, isFree, thumbnailUrl } = req.body;

      if (!title || !description || !categoryId) {
        return res.status(400).json({ error: "Title, description, and category are required" });
      }

      const course = await storage.createCourse({
        teacherId: req.user!.id,
        categoryId: parseInt(categoryId),
        title,
        description,
        whatYouWillLearn: whatYouWillLearn || null,
        price: price || null,
        isFree: isFree || false,
        thumbnailUrl: thumbnailUrl || null,
      });

      res.json({ success: true, courseId: course.id, message: "Course created successfully" });
    } catch (error) {
      console.error("Create course error:", error);
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  // Update course (teachers only, own courses)
  app.put("/api/courses/:id", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only edit your own courses" });
      }

      const { title, description, whatYouWillLearn, categoryId, price, isFree, thumbnailUrl } = req.body;

      const updated = await storage.updateCourse(courseId, {
        title,
        description,
        whatYouWillLearn,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        price,
        isFree,
        thumbnailUrl,
      });

      res.json({ success: true, course: updated });
    } catch (error) {
      console.error("Update course error:", error);
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  // Get teacher's courses
  app.get("/api/my-courses", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const courses = await storage.getCoursesByTeacher(req.user!.id);

      const enrichedCourses = await Promise.all(
        courses.map(async (course) => {
          const lessons = await storage.getCourseLessons(course.id);
          const enrollments = await storage.getCourseEnrollments(course.id);

          return {
            ...course,
            lessonCount: lessons.length,
            enrollmentCount: enrollments.length,
          };
        })
      );

      res.json({ success: true, courses: enrichedCourses });
    } catch (error) {
      console.error("Get my courses error:", error);
      res.status(500).json({ error: "Failed to get courses" });
    }
  });

  // Get course categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCourseCategories();
      res.json({ success: true, categories });
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Add lesson to course (teachers only, own courses)
  app.post("/api/courses/:id/lessons", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only add lessons to your own courses" });
      }

      const { title, youtubeUrl, lessonOrder, durationMinutes } = req.body;

      if (!title || !youtubeUrl || lessonOrder === undefined) {
        return res.status(400).json({ error: "Title, YouTube URL, and lesson order are required" });
      }

      const lesson = await storage.createCourseLesson({
        courseId,
        title,
        youtubeUrl,
        lessonOrder: parseInt(lessonOrder),
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
      });

      res.json({ success: true, lessonId: lesson.id, message: "Lesson added successfully" });
    } catch (error) {
      console.error("Add lesson error:", error);
      res.status(500).json({ error: "Failed to add lesson" });
    }
  });

  // Get course lessons
  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const lessons = await storage.getCourseLessons(courseId);

      res.json({ success: true, lessons });
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({ error: "Failed to get lessons" });
    }
  });
}
