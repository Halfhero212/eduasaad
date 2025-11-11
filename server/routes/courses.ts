import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole, verifyToken, type AuthRequest } from "../middleware/auth";
import multer from "multer";
import { getStorageAdapter } from "../utils/storage-adapter";
import { fileTypeFromBuffer } from "file-type";

const upload = multer({ storage: multer.memoryStorage() });

export function registerCourseRoutes(app: Express) {
  // Upload course thumbnail (teachers only)
  app.post("/api/courses/upload-thumbnail", requireAuth, requireRole("teacher"), upload.single("thumbnail"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (req.file.size > maxSize) {
        return res.status(400).json({ error: "File size must be less than 5MB" });
      }

      // Inspect actual file bytes to verify it's a real image (prevents MIME spoofing)
      const fileType = await fileTypeFromBuffer(req.file.buffer);
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      
      if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
        return res.status(400).json({ error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" });
      }

      // Use detected extension from byte inspection (more secure than client-provided extension)
      const extension = fileType.ext;

      const storageAdapter = getStorageAdapter();
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `course-${timestamp}-${randomString}.${extension}`;
      
      // Build storage path
      const filepath = `thumbnails/${filename}`;

      // Upload to storage (works on both Replit and regular servers)
      const result = await storageAdapter.uploadFromBytes(filepath, req.file.buffer, {
        contentType: fileType.mime
      });
      
      if (!result.ok) {
        console.error("Upload failed:", result.error);
        return res.status(500).json({ error: "Failed to upload file to storage" });
      }

      // Return the public URL for the uploaded file
      const publicUrl = storageAdapter.getPublicUrl(filepath);
      res.json({ success: true, url: publicUrl });
    } catch (error) {
      console.error("Upload thumbnail error:", error);
      res.status(500).json({ error: "Failed to upload thumbnail" });
    }
  });

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
      let enrollmentStatus: string | null = null;
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          // Teachers who own the course can see the enrolled view
          if (decoded.role === "teacher" && decoded.id === course.teacherId) {
            isEnrolled = true;
          } 
          // Students with confirmed or free enrollment can see the enrolled view
          else if (decoded.role === "student") {
            const enrollment = await storage.getEnrollment(decoded.id, courseId);
            if (enrollment) {
              enrollmentStatus = enrollment.purchaseStatus;
              // Only consider enrolled if status is "confirmed" or "free"
              isEnrolled = enrollment.purchaseStatus === "confirmed" || enrollment.purchaseStatus === "free";
            }
          }
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
        enrollmentStatus,
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

  // Get course lessons (with enrollment verification and video URL protection)
  app.get("/api/courses/:courseId/lessons", requireAuth, async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check authorization: teacher owns course OR student is enrolled
      let isAuthorized = false;
      
      if (userRole === "teacher" && course.teacherId === userId) {
        isAuthorized = true;
      } else if (userRole === "student") {
        const enrollment = await storage.getEnrollment(userId, courseId);
        if (enrollment && (enrollment.purchaseStatus === "confirmed" || enrollment.purchaseStatus === "free")) {
          isAuthorized = true;
        }
      } else if (userRole === "superadmin") {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        // Return lessons WITHOUT video URLs for unauthorized users
        const lessons = await storage.getCourseLessons(courseId);
        const safeLessons = lessons.map(lesson => ({
          id: lesson.id,
          courseId: lesson.courseId,
          title: lesson.title,
          lessonOrder: lesson.lessonOrder,
          durationMinutes: lesson.durationMinutes,
          // youtubeUrl is intentionally omitted
        }));
        return res.json({ success: true, lessons: safeLessons, restricted: true });
      }

      // Authorized users get full lesson data with video URLs
      const lessons = await storage.getCourseLessons(courseId);
      
      // Log video access for audit trail
      console.log(`🎥 Video access: User ${userId} (${req.user!.fullName}) accessed ${lessons.length} lessons for course ${courseId}`);

      res.json({ success: true, lessons, restricted: false });
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({ error: "Failed to get lessons" });
    }
  });

  // Update lesson (teachers only, own courses)
  app.put("/api/lessons/:id", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getCourseLesson(lessonId);

      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (!course || course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only edit your own lessons" });
      }

      const { title, youtubeUrl, durationMinutes } = req.body;
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (youtubeUrl !== undefined) updates.youtubeUrl = youtubeUrl;
      if (durationMinutes !== undefined) updates.durationMinutes = durationMinutes ? parseInt(durationMinutes) : null;

      await storage.updateCourseLesson(lessonId, updates);

      res.json({ success: true, message: "Lesson updated successfully" });
    } catch (error) {
      console.error("Update lesson error:", error);
      res.status(500).json({ error: "Failed to update lesson" });
    }
  });

  // Delete lesson (teachers only, own courses)
  app.delete("/api/lessons/:id", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getCourseLesson(lessonId);

      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (!course || course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only delete your own lessons" });
      }

      await storage.deleteCourseLesson(lessonId);

      res.json({ success: true, message: "Lesson deleted successfully" });
    } catch (error) {
      console.error("Delete lesson error:", error);
      res.status(500).json({ error: "Failed to delete lesson" });
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

      const { title, description, whatYouWillLearn, thumbnailUrl, price, isFree, categoryId } = req.body;
      const updates: any = {};
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (whatYouWillLearn !== undefined) updates.whatYouWillLearn = whatYouWillLearn;
      if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;
      if (price !== undefined) updates.price = price;
      if (isFree !== undefined) updates.isFree = isFree;
      if (categoryId) updates.categoryId = parseInt(categoryId);

      await storage.updateCourse(courseId, updates);

      res.json({ success: true, message: "Course updated successfully" });
    } catch (error) {
      console.error("Update course error:", error);
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  // Delete course (teachers only, own courses)
  app.delete("/api/courses/:id", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only delete your own courses" });
      }

      await storage.deleteCourse(courseId);

      res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
      console.error("Delete course error:", error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // Get course reviews
  app.get("/api/courses/:courseId/reviews", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const reviews = await storage.getCourseReviews(courseId);
      
      // Get student names for each review
      const reviewsWithNames = await Promise.all(
        reviews.map(async (review) => {
          const student = await storage.getUser(review.studentId);
          return {
            ...review,
            studentName: student?.fullName || "Unknown",
          };
        })
      );

      res.json({ success: true, reviews: reviewsWithNames });
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });

  // Create course review (students only, enrolled students)
  app.post("/api/courses/:courseId/reviews", requireAuth, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = req.user!.id;

      // Check if student is enrolled
      const enrollment = await storage.getEnrollment(studentId, courseId);
      if (!enrollment || enrollment.purchaseStatus !== "confirmed" && enrollment.purchaseStatus !== "free") {
        return res.status(403).json({ error: "You must be enrolled in this course to leave a review" });
      }

      // Check if student already reviewed
      const existingReview = await storage.getStudentCourseReview(studentId, courseId);
      if (existingReview) {
        return res.status(400).json({ error: "You have already reviewed this course" });
      }

      const { rating, review } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const newReview = await storage.createCourseReview({
        courseId,
        studentId,
        rating: parseInt(rating),
        review: review || null,
      });

      res.json({ success: true, review: newReview });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Update course review (students only, own reviews)
  app.put("/api/reviews/:id", requireAuth, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await storage.getCourseReview(reviewId);

      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      if (review.studentId !== req.user!.id) {
        return res.status(403).json({ error: "You can only edit your own reviews" });
      }

      const { rating, review: reviewText } = req.body;
      const updates: any = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }
        updates.rating = parseInt(rating);
      }
      if (reviewText !== undefined) updates.review = reviewText;

      await storage.updateCourseReview(reviewId, updates);

      res.json({ success: true, message: "Review updated successfully" });
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  // Delete course review (students only, own reviews)
  app.delete("/api/reviews/:id", requireAuth, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await storage.getCourseReview(reviewId);

      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      if (review.studentId !== req.user!.id) {
        return res.status(403).json({ error: "You can only delete your own reviews" });
      }

      await storage.deleteCourseReview(reviewId);

      res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  // Get course announcements
  app.get("/api/courses/:courseId/announcements", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const announcements = await storage.getCourseAnnouncements(courseId);

      res.json({ success: true, announcements });
    } catch (error) {
      console.error("Get announcements error:", error);
      res.status(500).json({ error: "Failed to get announcements" });
    }
  });

  // Create course announcement (teachers only, own courses)
  app.post("/api/courses/:courseId/announcements", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (course.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only create announcements for your own courses" });
      }

      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      const announcement = await storage.createCourseAnnouncement({
        courseId,
        teacherId: req.user!.id,
        title,
        content,
      });

      // Notify all enrolled students
      const enrollments = await storage.getCourseEnrollments(courseId);
      const confirmedEnrollments = enrollments.filter(
        (e) => e.purchaseStatus === "confirmed" || e.purchaseStatus === "free"
      );

      for (const enrollment of confirmedEnrollments) {
        await storage.createNotification({
          userId: enrollment.studentId,
          type: "new_content",
          title: `إعلان جديد: ${title}`,
          message: `لديك إعلان جديد في دورة ${course.title}`,
          relatedId: announcement.id,
          metadata: JSON.stringify({ courseId, announcementId: announcement.id }),
          read: false,
        });
      }

      res.json({ success: true, announcement });
    } catch (error) {
      console.error("Create announcement error:", error);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  });

  // Delete course announcement (teachers only, own courses)
  app.delete("/api/announcements/:id", requireAuth, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      const announcement = await storage.getCourseAnnouncement(announcementId);

      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      if (announcement.teacherId !== req.user!.id) {
        return res.status(403).json({ error: "You can only delete your own announcements" });
      }

      await storage.deleteCourseAnnouncement(announcementId);

      res.json({ success: true, message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Delete announcement error:", error);
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

  // Get course completion percentage for a student
  app.get("/api/courses/:courseId/completion", requireAuth, async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = req.user!.id;

      // Get all lessons for this course
      const lessons = await storage.getCourseLessons(courseId);
      if (lessons.length === 0) {
        return res.json({ success: true, completionPercentage: 0, completedLessons: 0, totalLessons: 0 });
      }

      // Get student's progress for this course
      const progress = await storage.getStudentProgressForCourse(studentId, courseId);
      const completedLessons = progress.filter(p => p.completed).length;
      const completionPercentage = Math.round((completedLessons / lessons.length) * 100);

      res.json({ 
        success: true, 
        completionPercentage, 
        completedLessons, 
        totalLessons: lessons.length 
      });
    } catch (error) {
      console.error("Get completion error:", error);
      res.status(500).json({ error: "Failed to get completion percentage" });
    }
  });
}
