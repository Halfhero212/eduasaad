import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, serial, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with three roles: superadmin, teacher, student
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().$type<"superadmin" | "teacher" | "student">(),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Course Categories
export const courseCategories = pgTable("course_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
});

export const insertCourseCategorySchema = createInsertSchema(courseCategories).omit({ id: true });
export type InsertCourseCategory = z.infer<typeof insertCourseCategorySchema>;
export type CourseCategory = typeof courseCategories.$inferSelect;

// Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => courseCategories.id),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 600 }).notNull(),
  description: text("description").notNull(),
  whatYouWillLearn: text("what_you_will_learn"),
  thumbnailUrl: text("thumbnail_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  isFree: boolean("is_free").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  slug: true, // slug is auto-generated from title
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Course Lessons
export const courseLessons = pgTable("course_lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  lessonOrder: integer("lesson_order").notNull(),
  durationMinutes: integer("duration_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseLessonSchema = createInsertSchema(courseLessons).omit({
  id: true,
  createdAt: true,
});

export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;
export type CourseLesson = typeof courseLessons.$inferSelect;

// Enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  purchaseStatus: varchar("purchase_status", { length: 50 }).default("pending").notNull().$type<"pending" | "confirmed" | "free">(),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

// Lesson Progress - tracks completion and last watched position
export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  lessonId: integer("lesson_id").notNull().references(() => courseLessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false).notNull(),
  lastPosition: integer("last_position").default(0), // seconds watched
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({
  id: true,
  updatedAt: true,
});

export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => courseLessons.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

// Quiz Submissions
export const quizSubmissions = pgTable("quiz_submissions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => users.id),
  imageUrls: text("image_urls").array(), // Array of image URLs in object storage
  teacherImageUrls: text("teacher_image_urls").array(),
  score: integer("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  gradedAt: timestamp("graded_at"),
});

export const insertQuizSubmissionSchema = createInsertSchema(quizSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertQuizSubmission = z.infer<typeof insertQuizSubmissionSchema>;
export type QuizSubmission = typeof quizSubmissions.$inferSelect;

// Lesson Comments - Q&A system
export const lessonComments = pgTable("lesson_comments", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => courseLessons.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id"), // For replies
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLessonCommentSchema = createInsertSchema(lessonComments).omit({
  id: true,
  createdAt: true,
});

export type InsertLessonComment = z.infer<typeof insertLessonCommentSchema>;
export type LessonComment = typeof lessonComments.$inferSelect;

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull().$type<"new_question" | "quiz_submission" | "reply" | "new_content" | "enrollment_confirmed" | "new_enrollment" | "enrollment_request" | "grade_received">(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"), // Can reference comment, quiz, lesson, course, etc.
  metadata: text("metadata"), // JSON string for additional context (e.g., {courseId, lessonId})
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Platform Settings (for WhatsApp number, etc.)
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Course Reviews
export const courseReviews = pgTable("course_reviews", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseReviewSchema = createInsertSchema(courseReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCourseReview = z.infer<typeof insertCourseReviewSchema>;
export type CourseReview = typeof courseReviews.$inferSelect;

// Course Announcements
export const courseAnnouncements = pgTable("course_announcements", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseAnnouncementSchema = createInsertSchema(courseAnnouncements).omit({
  id: true,
  createdAt: true,
});

export type InsertCourseAnnouncement = z.infer<typeof insertCourseAnnouncementSchema>;
export type CourseAnnouncement = typeof courseAnnouncements.$inferSelect;
