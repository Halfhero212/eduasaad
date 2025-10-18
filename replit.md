# EduPlatform - Full-Stack Learning Management System

## Project Overview
A complete learning platform for course delivery with three-tier user hierarchy (superadmin, teachers, students). The platform enables teachers to upload video courses with quizzes, students to learn and track progress, and superadmin to manage the entire platform.

## Architecture
- **Frontend**: React + Vite + Wouter routing + TanStack Query + Shadcn UI
- **Backend**: Express.js + PostgreSQL (Drizzle ORM) + JWT authentication
- **Storage**: Replit Object Storage for quiz submission images
- **Deployment Target**: Vercel (both frontend and backend on same port 5000)

## User Roles & Capabilities

### Superadmin
- Creates teacher accounts with auto-generated passwords
- Views platform statistics (teacher count, student count, courses, enrollments)
- Manages platform settings (WhatsApp number for course purchases)
- Approves/confirms student enrollments manually

### Teachers
- Creates courses with categories, pricing, thumbnails
- Uploads video lessons (YouTube URLs) with ordering
- Creates quizzes for lessons with deadlines
- Grades quiz submissions (uploads as images)
- Replies to student questions on specific videos
- Views course enrollments and student progress

### Students
- Self-registers with email/password
- Browses public course catalog filtered by category
- Enrolls in courses (free or paid via WhatsApp)
- Watches videos with automatic progress tracking (resumes from last position)
- Submits quiz solutions as images (auto-deleted after 1 week)
- Asks questions on specific videos (only course teacher can reply)
- Receives notifications for grades, replies, new content

## Key Features

### Authentication & Authorization
- JWT-based authentication with role-based access control
- Secure password hashing with bcrypt
- Session management with 7-day token expiry
- Protected routes with middleware (`requireAuth`, `requireRole`)

### Course Management
- Courses belong to categories (Programming, Math, Science, etc.)
- Each course has title, description, what you'll learn, price, thumbnail
- Courses can be free or paid
- Lessons ordered sequentially with YouTube video URLs
- Lesson duration tracking

### Enrollment & Progress
- Students enroll in courses (pending → confirmed → access granted)
- Paid courses require WhatsApp contact for payment confirmation
- Progress tracking per lesson (completed status, last video position)
- Resume video from exact position on return
- Course progress percentage calculation

### Quiz System
- Teachers create quizzes attached to lessons
- Students submit solutions as image files (up to 5 images)
- Images uploaded to Replit Object Storage
- Teachers grade submissions with score and feedback
- **Automatic cleanup**: Images deleted after 1 week via cron job (runs daily at 2 AM)

### Q&A System
- Students ask questions on specific video lessons
- Only the course teacher can reply
- Threaded replies with parent-child relationship
- Notifications sent for new questions and replies

### Notifications
- Real-time notification system for:
  - New quiz submissions
  - Quiz grades received
  - Teacher replies to questions
  - New content added to enrolled courses
  - Enrollment confirmation
- Mark as read functionality

### WhatsApp Integration
- "Buy Course" button generates WhatsApp deep link
- Pre-filled message with course details
- Platform WhatsApp number configurable by superadmin
- Default number: 9647801234567 (Iraqi format)

## Database Schema

### Core Tables
- `users`: email, password (hashed), fullName, role (superadmin/teacher/student)
- `course_categories`: name, description
- `courses`: teacherId, categoryId, title, description, whatYouWillLearn, price, isFree, thumbnailUrl
- `course_lessons`: courseId, title, youtubeUrl, lessonOrder, durationMinutes
- `enrollments`: studentId, courseId, purchaseStatus (pending/confirmed/free), enrolledAt
- `lesson_progress`: studentId, lessonId, completed, lastPosition, completedAt
- `quizzes`: lessonId, title, description, deadline
- `quiz_submissions`: quizId, studentId, imageUrls (array), score, feedback, gradedAt
- `lesson_comments`: lessonId, userId, content, parentCommentId (for replies)
- `notifications`: userId, type, title, message, read, relatedId
- `platform_settings`: key-value pairs (e.g., whatsapp_number)

## API Routes

### Authentication (`/api/auth/`)
- `POST /register` - Student self-registration
- `POST /login` - User login (all roles)
- `GET /me` - Get current user info
- `POST /create-teacher` - Superadmin creates teacher account

### Courses (`/api/courses/`)
- `GET /` - List all courses (public, with category filter)
- `GET /:id` - Get course details with lessons
- `POST /` - Teacher creates course
- `PUT /:id` - Teacher updates own course
- `GET /api/my-courses` - Teacher's courses list
- `POST /:id/lessons` - Teacher adds lesson to course
- `GET /:courseId/lessons` - Get course lessons

### Enrollments (`/api/courses/`, `/api/enrollments/`)
- `POST /courses/:id/enroll` - Student enrolls in course
- `GET /enrollments/my-courses` - Student's enrolled courses
- `POST /lessons/:lessonId/progress` - Update lesson progress
- `GET /lessons/:lessonId` - Get lesson details with progress

### Quizzes (`/api/quizzes/`)
- `POST /` - Teacher creates quiz
- `GET /lessons/:lessonId/quizzes` - Get quizzes for lesson
- `POST /:quizId/submit` - Student submits quiz (with image upload)
- `GET /:quizId/submissions` - Get submissions (teacher: all, student: own)
- `PUT /submissions/:submissionId/grade` - Teacher grades submission

### Comments (`/api/lessons/`)
- `GET /:lessonId/comments` - Get comments for lesson
- `POST /:lessonId/comments` - Student posts question
- `POST /api/comments/:commentId/reply` - Teacher replies to question

### Notifications (`/api/notifications/`)
- `GET /` - Get user's notifications
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all as read

### Admin (`/api/admin/`)
- `GET /teachers` - List all teachers (superadmin)
- `GET /students` - List all students (superadmin)
- `GET /stats` - Platform statistics (superadmin)
- `GET /settings` - Get platform settings (superadmin)
- `PUT /settings/:key` - Update platform setting (superadmin)
- `PUT /enrollments/:id/status` - Update enrollment status (superadmin/teacher)

### Utility
- `GET /api/whatsapp-number` - Get platform WhatsApp number

## Cron Jobs
- **Daily at 2 AM**: Cleanup quiz submission images older than 7 days
  - Finds submissions > 1 week old
  - Deletes images from object storage
  - Updates database to remove image URLs
  - Prevents storage overflow

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - JWT signing secret
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` - Replit object storage bucket
- `PRIVATE_OBJECT_DIR` - Private object storage directory
- `PUBLIC_OBJECT_SEARCH_PATHS` - Public object paths

## Initial Seed Data
- **Superadmin**: admin@eduplatform.com / admin123 ⚠️ Change in production!
- **Categories**: Programming, Mathematics, Science, Languages, Business, Design
- **WhatsApp Number**: 9647801234567 (configurable)

## Frontend Structure (To Be Implemented)
- `/` - Public home page with course catalog
- `/login` - Login page (all roles)
- `/register` - Student registration
- `/dashboard` - Role-based dashboard redirect
  - `/dashboard/superadmin` - Platform management
  - `/dashboard/teacher` - Course/lesson management
  - `/dashboard/student` - My enrolled courses
- `/courses/:id` - Course detail page
- `/courses/:courseId/lessons/:lessonId` - Video player with Q&A and quizzes

## Design Guidelines
- Modern, clean learning platform aesthetic
- Responsive design for mobile and desktop
- Course cards with thumbnails and progress indicators
- Video player with custom controls
- Comment threads with teacher/student distinction
- Notification bell with unread count

## Technical Notes
- All times in UTC, converted to local in frontend
- YouTube videos embedded via iframe
- Progress auto-saved every 10 seconds during playback
- Quiz images max 5 per submission
- Teacher accounts have random-generated 12-char passwords
- Students can only see their own grades and comments
- Teachers can only manage their own courses

## Development Workflow
1. Backend changes in `server/` → auto-restart workflow
2. Frontend changes in `client/` → hot module reload
3. Schema changes → `npm run db:push` to sync database
4. Manual test via browser at port 5000

## Security Considerations
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens in Authorization header
- Role-based access control on all sensitive routes
- Input validation with Zod schemas
- SQL injection protection via Drizzle ORM
- File upload validation (max 5 images, multer memory storage)

## Known Limitations
- YouTube-only video hosting (no direct uploads)
- Images deleted after 1 week (not configurable)
- Single WhatsApp number for all courses
- No email notifications (only in-app)
- No course preview/demo lessons
- No student-to-student communication
- No course ratings/reviews
