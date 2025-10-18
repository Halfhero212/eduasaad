import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";

// Import pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import StudentDashboard from "@/pages/StudentDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import LessonPlayer from "@/pages/LessonPlayer";
import CourseDetail from "@/pages/CourseDetail";

// Import component examples for preview
import NavbarExample from "@/components/examples/Navbar";
import HeroSectionExample from "@/components/examples/HeroSection";
import CourseCardExample from "@/components/examples/CourseCard";
import StatCardExample from "@/components/examples/StatCard";
import VideoPlayerExample from "@/components/examples/VideoPlayer";
import QuizCardExample from "@/components/examples/QuizCard";
import CommentSectionExample from "@/components/examples/CommentSection";
import StudentProgressTableExample from "@/components/examples/StudentProgressTable";
import AdminUserManagementExample from "@/components/examples/AdminUserManagement";
import WhatsAppPurchaseButtonExample from "@/components/examples/WhatsAppPurchaseButton";

function Router() {
  return (
    <Switch>
      {/* Main Pages */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/teacher" component={TeacherDashboard} />
      <Route path="/dashboard/superadmin" component={SuperAdminDashboard} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/courses/:courseId/lessons/:lessonId" component={LessonPlayer} />

      {/* Component Examples */}
      <Route path="/examples/navbar" component={NavbarExample} />
      <Route path="/examples/hero" component={HeroSectionExample} />
      <Route path="/examples/course-card" component={CourseCardExample} />
      <Route path="/examples/stat-card" component={StatCardExample} />
      <Route path="/examples/video-player" component={VideoPlayerExample} />
      <Route path="/examples/quiz-card" component={QuizCardExample} />
      <Route path="/examples/comment-section" component={CommentSectionExample} />
      <Route path="/examples/student-progress" component={StudentProgressTableExample} />
      <Route path="/examples/admin-management" component={AdminUserManagementExample} />
      <Route path="/examples/whatsapp-button" component={WhatsAppPurchaseButtonExample} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
