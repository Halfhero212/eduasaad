# الباشق العراقي (Al-Bashiq Al-Iraqi) - Full-Stack Learning Management System

## Overview
**الباشق العراقي** is a comprehensive e-learning platform designed for course delivery with a three-tier user hierarchy: superadmin, teachers, and students. Its core purpose is to enable teachers to create and deliver video-based courses with quizzes, allow students to learn and track their progress, and provide superadmins with full platform management capabilities. The platform aims to offer a robust and user-friendly experience for online education, supporting bilingual (Arabic/English) content and a streamlined enrollment process for both free and paid courses, integrating WhatsApp for payment coordination.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with frequent check-ins. Ask before making major architectural changes or adding new external dependencies. Do not make changes to files related to authentication without explicit approval.

## System Architecture
The platform is a full-stack application utilizing a modern JAMstack-inspired architecture.

### UI/UX Decisions
- **Frontend Framework**: React with Vite for fast development and build times.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query for data fetching, caching, and synchronization.
- **Component Library**: Shadcn UI for a consistent, accessible, and customizable UI.
- **Localization**: Full bilingual support (Arabic/English) with RTL layout enabled for Arabic, using the Cairo font.
- **Design Aesthetic**: Modern, clean, and responsive design for optimal viewing on both mobile and desktop devices. Features include course cards with thumbnails, custom video player controls, threaded comments, and a notification system.

### Technical Implementations
- **Backend Framework**: Express.js for a robust and scalable API layer.
- **Database**: PostgreSQL managed with Drizzle ORM for type-safe and efficient database interactions.
- **Authentication**: JWT-based authentication with role-based access control (superadmin, teacher, student). Secure password hashing using bcrypt (10 rounds). Password reset functionality is implemented with secure tokens.
- **File Storage**: Replit Object Storage is used for storing course thumbnails and quiz submission images. Server-side MIME type validation and randomized filenames enhance security.
- **Video Content**: YouTube URLs are used for video lessons, with client-side features for progress tracking and resume playback. Enhanced download protection includes: privacy-enhanced YouTube player (youtube-nocookie.com), disabled fullscreen, hidden video info, disabled keyboard shortcuts, and right-click prevention. For maximum security, teachers should use YouTube's privacy settings (Unlisted videos, Domain Restrictions).
- **Payment Workflow**: Integrates WhatsApp for direct student-teacher communication regarding payments for paid courses, with superadmin confirmation for enrollment activation.
- **Notifications**: Real-time, in-app notification system with clickable navigation. Displays in navbar with unread badge, auto-refreshes every 30 seconds. Notifications for quiz submissions, grades, replies, new content, enrollment confirmations, and teacher enrollment alerts (both free and paid). Clicking a notification marks it as read and navigates directly to the relevant page (comment notifications → specific lesson video page, enrollment notifications → teacher dashboard).
- **Cron Jobs**: A daily cron job is configured to clean up quiz submission images older than 7 days from object storage to manage resources.
- **Deployment**: Designed for deployment on Vercel, with both frontend and backend served from the same port.

### Feature Specifications
- **User Management**: Superadmins can create teacher accounts. Students can self-register.
- **Course Management**: Teachers can create courses with categories, pricing, descriptions, and upload custom thumbnails. Lessons are video-based (YouTube URLs) with sequential ordering.
- **Enrollment System**: Supports both free (immediate access) and paid courses (pending status until superadmin confirmation after WhatsApp payment). Superadmin dashboard provides comprehensive oversight of all enrollments.
- **Quiz System**: Teachers can create quizzes for lessons. Students submit image-based solutions, which teachers grade with feedback.
- **Q&A System**: Students can ask questions on specific video lessons, and only the course teacher can reply, forming threaded discussions.
- **Progress Tracking**: Automatic tracking of video progress, allowing students to resume lessons from their last watched position. Course completion percentage is calculated based on completed vs. total lessons.
- **Course Reviews & Ratings**: Students can rate courses (1-5 stars) and write reviews after enrollment. One review per student per course, with edit and delete capabilities.
- **Course Announcements**: Teachers can post announcements to enrolled students, with automatic notifications sent to all enrolled students.
- **Platform Settings**: Superadmin can manage global platform settings.
- **Platform Analytics**: Superadmin dashboard displays detailed statistics including course analytics (student counts per course, lesson counts, enrollment status breakdown) and teacher analytics (course count, total students, total lessons, detailed course breakdown).

### System Design Choices
- **Role-Based Access Control**: Strict middleware enforces access based on user roles for all sensitive API routes.
- **Input Validation**: Zod schemas are used for robust input validation on both frontend and backend.
- **Security**: Focus on preventing SQL injection (Drizzle ORM), secure password handling, and token-based authentication. File uploads are validated to mitigate common vulnerabilities.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Replit Object Storage**: Used for storing course thumbnails and quiz submission images.
- **YouTube**: Used for hosting and embedding all course video content.
- **WhatsApp**: Integrated for facilitating communication between students and teachers for paid course enrollments.
- **bcrypt**: Library for secure password hashing.
- **JWT (JSON Web Tokens)**: Used for user authentication and authorization.
- **Vite**: Frontend build tool.
- **Wouter**: Client-side routing library.
- **TanStack Query**: Data fetching and state management library.
- **Shadcn UI**: UI component library.
- **Express.js**: Backend web framework.
- **Drizzle ORM**: Object-Relational Mapper for PostgreSQL.
- **Zod**: Schema validation library.
- **Multer**: Middleware for handling `multipart/form-data`, primarily for file uploads.