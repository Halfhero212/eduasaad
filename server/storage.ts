import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Course,
  type InsertCourse,
  type CourseLesson,
  type InsertCourseLesson,
  type CourseCategory,
  type InsertCourseCategory,
  type Enrollment,
  type InsertEnrollment,
  type LessonProgress,
  type InsertLessonProgress,
  type Quiz,
  type InsertQuiz,
  type QuizSubmission,
  type InsertQuizSubmission,
  type LessonComment,
  type InsertLessonComment,
  type Notification,
  type InsertNotification,
  type PlatformSetting,
  type InsertPlatformSetting,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type CourseReview,
  type InsertCourseReview,
  type CourseAnnouncement,
  type InsertCourseAnnouncement,
  users,
  courses,
  courseLessons,
  courseCategories,
  enrollments,
  lessonProgress,
  quizzes,
  quizSubmissions,
  lessonComments,
  notifications,
  platformSettings,
  passwordResetTokens,
  courseReviews,
  courseAnnouncements,
} from "@shared/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  getAllTeachers(): Promise<User[]>;
  getAllStudents(): Promise<User[]>;

  // Course Category operations
  getCourseCategory(id: number): Promise<CourseCategory | undefined>;
  getAllCourseCategories(): Promise<CourseCategory[]>;
  createCourseCategory(category: InsertCourseCategory): Promise<CourseCategory>;
  updateCourseCategory(id: number, updates: Partial<InsertCourseCategory>): Promise<CourseCategory | undefined>;
  deleteCourseCategory(id: number): Promise<void>;

  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(categoryId?: number): Promise<Course[]>;
  getCoursesByTeacher(teacherId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, updates: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<void>;

  // Course Lesson operations
  getCourseLesson(id: number): Promise<CourseLesson | undefined>;
  getCourseLessons(courseId: number): Promise<CourseLesson[]>;
  createCourseLesson(lesson: InsertCourseLesson): Promise<CourseLesson>;
  updateCourseLesson(id: number, updates: Partial<InsertCourseLesson>): Promise<CourseLesson | undefined>;
  deleteCourseLesson(id: number): Promise<void>;

  // Enrollment operations
  getEnrollment(studentId: number, courseId: number): Promise<Enrollment | undefined>;
  getEnrollmentById(id: number): Promise<Enrollment | undefined>;
  getStudentEnrollments(studentId: number): Promise<Enrollment[]>;
  getCourseEnrollments(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentStatus(id: number, status: "pending" | "confirmed" | "free"): Promise<Enrollment | undefined>;

  // Lesson Progress operations
  getLessonProgress(studentId: number, lessonId: number): Promise<LessonProgress | undefined>;
  getStudentProgressForCourse(studentId: number, courseId: number): Promise<LessonProgress[]>;
  upsertLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;

  // Quiz operations
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByLesson(lessonId: number): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, updates: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<void>;

  // Quiz Submission operations
  getQuizSubmission(id: number): Promise<QuizSubmission | undefined>;
  getQuizSubmissionsByQuiz(quizId: number): Promise<QuizSubmission[]>;
  getQuizSubmissionsByStudent(studentId: number): Promise<QuizSubmission[]>;
  createQuizSubmission(submission: InsertQuizSubmission): Promise<QuizSubmission>;
  updateQuizSubmission(id: number, updates: Partial<InsertQuizSubmission>): Promise<QuizSubmission | undefined>;
  getOldQuizSubmissions(daysOld: number): Promise<QuizSubmission[]>;

  // Lesson Comment operations
  getLessonComment(id: number): Promise<LessonComment | undefined>;
  getLessonComments(lessonId: number): Promise<LessonComment[]>;
  createLessonComment(comment: InsertLessonComment): Promise<LessonComment>;

  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: number, unreadOnly?: boolean): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;

  // Platform Settings operations
  getPlatformSetting(key: string): Promise<PlatformSetting | undefined>;
  getAllPlatformSettings(): Promise<PlatformSetting[]>;
  setPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting>;
  updatePlatformSetting(key: string, value: string): Promise<PlatformSetting | undefined>;

  // Password Reset Token operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  deleteExpiredPasswordResetTokens(): Promise<void>;

  // Course Review operations
  getCourseReview(id: number): Promise<CourseReview | undefined>;
  getCourseReviews(courseId: number): Promise<CourseReview[]>;
  getStudentCourseReview(studentId: number, courseId: number): Promise<CourseReview | undefined>;
  createCourseReview(review: InsertCourseReview): Promise<CourseReview>;
  updateCourseReview(id: number, updates: Partial<InsertCourseReview>): Promise<CourseReview | undefined>;
  deleteCourseReview(id: number): Promise<void>;

  // Course Announcement operations
  getCourseAnnouncement(id: number): Promise<CourseAnnouncement | undefined>;
  getCourseAnnouncements(courseId: number): Promise<CourseAnnouncement[]>;
  createCourseAnnouncement(announcement: InsertCourseAnnouncement): Promise<CourseAnnouncement>;
  updateCourseAnnouncement(id: number, updates: Partial<InsertCourseAnnouncement>): Promise<CourseAnnouncement | undefined>;
  deleteCourseAnnouncement(id: number): Promise<void>;
}

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user as any).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(updates as any).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllTeachers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "teacher"));
  }

  async getAllStudents(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "student"));
  }

  // Course Category operations
  async getCourseCategory(id: number): Promise<CourseCategory | undefined> {
    const [category] = await db.select().from(courseCategories).where(eq(courseCategories.id, id));
    return category;
  }

  async getAllCourseCategories(): Promise<CourseCategory[]> {
    return db.select().from(courseCategories);
  }

  async createCourseCategory(category: InsertCourseCategory): Promise<CourseCategory> {
    const [newCategory] = await db.insert(courseCategories).values(category).returning();
    return newCategory;
  }

  async updateCourseCategory(id: number, updates: Partial<InsertCourseCategory>): Promise<CourseCategory | undefined> {
    const [updated] = await db.update(courseCategories).set(updates).where(eq(courseCategories.id, id)).returning();
    return updated;
  }

  async deleteCourseCategory(id: number): Promise<void> {
    await db.delete(courseCategories).where(eq(courseCategories.id, id));
  }

  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getAllCourses(categoryId?: number): Promise<Course[]> {
    if (categoryId) {
      return db.select().from(courses).where(eq(courses.categoryId, categoryId));
    }
    return db.select().from(courses);
  }

  async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.teacherId, teacherId));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: number, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updated] = await db.update(courses).set(updates).where(eq(courses.id, id)).returning();
    return updated;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Course Lesson operations
  async getCourseLesson(id: number): Promise<CourseLesson | undefined> {
    const [lesson] = await db.select().from(courseLessons).where(eq(courseLessons.id, id));
    return lesson;
  }

  async getCourseLessons(courseId: number): Promise<CourseLesson[]> {
    return db.select().from(courseLessons).where(eq(courseLessons.courseId, courseId)).orderBy(courseLessons.lessonOrder);
  }

  async createCourseLesson(lesson: InsertCourseLesson): Promise<CourseLesson> {
    const [newLesson] = await db.insert(courseLessons).values(lesson).returning();
    return newLesson;
  }

  async updateCourseLesson(id: number, updates: Partial<InsertCourseLesson>): Promise<CourseLesson | undefined> {
    const [updated] = await db.update(courseLessons).set(updates).where(eq(courseLessons.id, id)).returning();
    return updated;
  }

  async deleteCourseLesson(id: number): Promise<void> {
    await db.delete(courseLessons).where(eq(courseLessons.id, id));
  }

  // Enrollment operations
  async getEnrollment(studentId: number, courseId: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));
    return enrollment;
  }

  async getEnrollmentById(id: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment;
  }

  async getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
  }

  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment as any).returning();
    return newEnrollment;
  }

  async updateEnrollmentStatus(id: number, status: "pending" | "confirmed" | "free"): Promise<Enrollment | undefined> {
    const [updated] = await db.update(enrollments).set({ purchaseStatus: status }).where(eq(enrollments.id, id)).returning();
    return updated;
  }

  async getPendingEnrollmentsForCourses(courseIds: number[]): Promise<Enrollment[]> {
    if (courseIds.length === 0) return [];
    return db.select().from(enrollments)
      .where(and(
        inArray(enrollments.courseId, courseIds),
        eq(enrollments.purchaseStatus, "pending")
      ))
      .orderBy(desc(enrollments.enrolledAt));
  }

  // Lesson Progress operations
  async getLessonProgress(studentId: number, lessonId: number): Promise<LessonProgress | undefined> {
    const [progress] = await db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.lessonId, lessonId)));
    return progress;
  }

  async getStudentProgressForCourse(studentId: number, courseId: number): Promise<LessonProgress[]> {
    return db.select({
      id: lessonProgress.id,
      studentId: lessonProgress.studentId,
      lessonId: lessonProgress.lessonId,
      completed: lessonProgress.completed,
      lastPosition: lessonProgress.lastPosition,
      completedAt: lessonProgress.completedAt,
      updatedAt: lessonProgress.updatedAt,
    })
      .from(lessonProgress)
      .innerJoin(courseLessons, eq(lessonProgress.lessonId, courseLessons.id))
      .where(and(eq(lessonProgress.studentId, studentId), eq(courseLessons.courseId, courseId)));
  }

  async upsertLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(progress.studentId, progress.lessonId);
    
    if (existing) {
      const [updated] = await db.update(lessonProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(eq(lessonProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(lessonProgress).values(progress).returning();
      return newProgress;
    }
  }

  // Quiz operations
  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizzesByLesson(lessonId: number): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId));
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async updateQuiz(id: number, updates: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const [updated] = await db.update(quizzes).set(updates).where(eq(quizzes.id, id)).returning();
    return updated;
  }

  async deleteQuiz(id: number): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  // Quiz Submission operations
  async getQuizSubmission(id: number): Promise<QuizSubmission | undefined> {
    const [submission] = await db.select().from(quizSubmissions).where(eq(quizSubmissions.id, id));
    return submission;
  }

  async getQuizSubmissionsByQuiz(quizId: number): Promise<QuizSubmission[]> {
    return db.select().from(quizSubmissions).where(eq(quizSubmissions.quizId, quizId)).orderBy(desc(quizSubmissions.submittedAt));
  }

  async getQuizSubmissionsByStudent(studentId: number): Promise<QuizSubmission[]> {
    return db.select().from(quizSubmissions).where(eq(quizSubmissions.studentId, studentId)).orderBy(desc(quizSubmissions.submittedAt));
  }

  async createQuizSubmission(submission: InsertQuizSubmission): Promise<QuizSubmission> {
    const [newSubmission] = await db.insert(quizSubmissions).values(submission).returning();
    return newSubmission;
  }

  async updateQuizSubmission(id: number, updates: Partial<InsertQuizSubmission>): Promise<QuizSubmission | undefined> {
    const [updated] = await db.update(quizSubmissions).set(updates).where(eq(quizSubmissions.id, id)).returning();
    return updated;
  }

  async getOldQuizSubmissions(daysOld: number): Promise<QuizSubmission[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    return db.select().from(quizSubmissions)
      .where(sql`${quizSubmissions.submittedAt} < ${cutoffDate}`);
  }

  // Lesson Comment operations
  async getLessonComment(id: number): Promise<LessonComment | undefined> {
    const [comment] = await db.select().from(lessonComments).where(eq(lessonComments.id, id));
    return comment;
  }

  async getLessonComments(lessonId: number): Promise<LessonComment[]> {
    return db.select().from(lessonComments)
      .where(eq(lessonComments.lessonId, lessonId))
      .orderBy(lessonComments.createdAt);
  }

  async createLessonComment(comment: InsertLessonComment): Promise<LessonComment> {
    const [newComment] = await db.insert(lessonComments).values(comment).returning();
    return newComment;
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getUserNotifications(userId: number, unreadOnly = false): Promise<Notification[]> {
    if (unreadOnly) {
      return db.select().from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
        .orderBy(desc(notifications.createdAt));
    }
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification as any).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  // Platform Settings operations
  async getPlatformSetting(key: string): Promise<PlatformSetting | undefined> {
    const [setting] = await db.select().from(platformSettings).where(eq(platformSettings.key, key));
    return setting;
  }

  async getAllPlatformSettings(): Promise<PlatformSetting[]> {
    return db.select().from(platformSettings);
  }

  async setPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting> {
    const existing = await this.getPlatformSetting(setting.key);
    
    if (existing) {
      const [updated] = await db.update(platformSettings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(platformSettings.key, setting.key))
        .returning();
      return updated;
    } else {
      const [newSetting] = await db.insert(platformSettings).values(setting).returning();
      return newSetting;
    }
  }

  async updatePlatformSetting(key: string, value: string): Promise<PlatformSetting | undefined> {
    const [updated] = await db.update(platformSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(platformSettings.key, key))
      .returning();
    return updated;
  }

  // Password Reset Token operations
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [newToken] = await db.insert(passwordResetTokens).values(token).returning();
    return newToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return resetToken;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db.delete(passwordResetTokens)
      .where(sql`${passwordResetTokens.expiresAt} < NOW()`);
  }

  // Course Review operations
  async getCourseReview(id: number): Promise<CourseReview | undefined> {
    const [review] = await db.select().from(courseReviews).where(eq(courseReviews.id, id));
    return review;
  }

  async getCourseReviews(courseId: number): Promise<CourseReview[]> {
    return db.select().from(courseReviews)
      .where(eq(courseReviews.courseId, courseId))
      .orderBy(desc(courseReviews.createdAt));
  }

  async getStudentCourseReview(studentId: number, courseId: number): Promise<CourseReview | undefined> {
    const [review] = await db.select().from(courseReviews)
      .where(and(eq(courseReviews.studentId, studentId), eq(courseReviews.courseId, courseId)));
    return review;
  }

  async createCourseReview(review: InsertCourseReview): Promise<CourseReview> {
    const [newReview] = await db.insert(courseReviews).values(review).returning();
    return newReview;
  }

  async updateCourseReview(id: number, updates: Partial<InsertCourseReview>): Promise<CourseReview | undefined> {
    const [updated] = await db.update(courseReviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courseReviews.id, id))
      .returning();
    return updated;
  }

  async deleteCourseReview(id: number): Promise<void> {
    await db.delete(courseReviews).where(eq(courseReviews.id, id));
  }

  // Course Announcement operations
  async getCourseAnnouncement(id: number): Promise<CourseAnnouncement | undefined> {
    const [announcement] = await db.select().from(courseAnnouncements).where(eq(courseAnnouncements.id, id));
    return announcement;
  }

  async getCourseAnnouncements(courseId: number): Promise<CourseAnnouncement[]> {
    return db.select().from(courseAnnouncements)
      .where(eq(courseAnnouncements.courseId, courseId))
      .orderBy(desc(courseAnnouncements.createdAt));
  }

  async createCourseAnnouncement(announcement: InsertCourseAnnouncement): Promise<CourseAnnouncement> {
    const [newAnnouncement] = await db.insert(courseAnnouncements).values(announcement).returning();
    return newAnnouncement;
  }

  async updateCourseAnnouncement(id: number, updates: Partial<InsertCourseAnnouncement>): Promise<CourseAnnouncement | undefined> {
    const [updated] = await db.update(courseAnnouncements)
      .set(updates)
      .where(eq(courseAnnouncements.id, id))
      .returning();
    return updated;
  }

  async deleteCourseAnnouncement(id: number): Promise<void> {
    await db.delete(courseAnnouncements).where(eq(courseAnnouncements.id, id));
  }
}

export const storage = new PostgresStorage();
