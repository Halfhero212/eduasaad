import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";

// Import pages
import Home from "@/pages/Home";
import AboutUs from "@/pages/AboutUs";
import Courses from "@/pages/Courses";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RequestPasswordReset from "@/pages/RequestPasswordReset";
import ResetPassword from "@/pages/ResetPassword";
import StudentDashboard from "@/pages/StudentDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import LessonPlayer from "@/pages/LessonPlayer";
import CourseDetail from "@/pages/CourseDetail";
import CourseManagement from "@/pages/CourseManagement";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutUs} />
      <Route path="/courses" component={Courses} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/request-reset" component={RequestPasswordReset} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/teacher" component={TeacherDashboard} />
      <Route path="/dashboard/superadmin" component={SuperAdminDashboard} />
      <Route path="/manage/courses/:id" component={CourseManagement} />
      <Route path="/courses/:id/:slug" component={CourseDetail} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/courses/:courseId/:slug/lessons/:lessonId" component={LessonPlayer} />
      <Route path="/courses/:courseId/lessons/:lessonId" component={LessonPlayer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">
                <ScrollToTop />
                <Router />
              </div>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
