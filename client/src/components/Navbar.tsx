import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, LayoutDashboard, Languages, Bell } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Navbar() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [location, setLocation] = useLocation();

  // Fetch notifications
  const { data: notificationsData } = useQuery<{ notifications: Notification[] }>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("PUT", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Get navigation link based on notification type
  const getNotificationLink = (notification: Notification): string => {
    switch (notification.type) {
      case "new_question":
      case "reply":
        // For comments, parse metadata to get courseId and lessonId
        try {
          if (notification.metadata) {
            const { courseId, lessonId } = JSON.parse(notification.metadata);
            return `/courses/${courseId}/lessons/${lessonId}`;
          }
        } catch (e) {
          console.error("Failed to parse notification metadata:", e);
        }
        // For legacy notifications without metadata, go to home
        return "/";
      case "quiz_submission":
        if (notification.metadata) {
          try {
            const meta = JSON.parse(notification.metadata);
            if (meta?.quizId) {
              return `/dashboard/teacher?focus=quizzes&quizId=${meta.quizId}`;
            }
          } catch (error) {
            console.error("Failed to parse notification metadata:", error);
          }
        }
        return "/dashboard/teacher";
      case "grade_received":
        // For students: navigate to student dashboard to see grade
        return "/dashboard/student";
      case "new_content":
        // Navigate to course page
        return `/courses/${notification.relatedId}`;
      case "enrollment_confirmed":
        // Navigate to course page
        return `/courses/${notification.relatedId}`;
      case "new_enrollment":
      case "enrollment_request":
        if (user?.role === "superadmin") {
          return "/dashboard/superadmin";
        }
        // For teachers: navigate to teacher dashboard enrollments
        return "/dashboard/teacher";
      default:
        return "/";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    // Navigate to related content
    setLocation(getNotificationLink(notification));
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "superadmin") return "/dashboard/superadmin";
    if (user.role === "teacher") return "/dashboard/teacher";
    return "/dashboard/student";
  };

  const getRoleBadgeColor = () => {
    if (user?.role === "superadmin") return "destructive";
    if (user?.role === "teacher") return "secondary";
    return "default";
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate px-2 py-1 rounded-md">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">{t("app.name")}</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/courses" data-testid="link-nav-courses">
              <Button
                variant={location === "/courses" ? "default" : "ghost"}
                size="sm"
                className="no-default-active-elevate"
              >
                {t("nav.browse")}
              </Button>
            </Link>
            {isAuthenticated && user?.role === "student" && (
              <Link href="/dashboard/student" data-testid="link-nav-learning">
                <Button
                  variant={location.startsWith("/dashboard/student") ? "default" : "ghost"}
                  size="sm"
                  className="no-default-active-elevate"
                >
                  {t("nav.my_learning")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            data-testid="button-language-toggle"
            title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Languages className="w-5 h-5" />
            <span className="sr-only">Toggle language</span>
          </Button>

          {/* Notifications */}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-testid="button-notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      data-testid="badge-unread-count"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  {t("notifications.title")} ({unreadCount} {t("notifications.unread")})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-96">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex flex-col items-start p-4 cursor-pointer ${
                          !notification.read ? "bg-accent/50" : ""
                        }`}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex items-start justify-between w-full gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t("notifications.no_notifications")}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
              <div className="hidden md:flex flex-col gap-1">
                <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
                <div className="w-12 h-3 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-testid="button-user-menu">
                <Button variant="ghost" className="gap-2 hover-elevate">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium" data-testid="text-user-name">{user.fullName}</span>
                    <Badge variant={getRoleBadgeColor()} className="text-xs" data-testid="text-user-role">
                      {t(`role.${user.role}`)}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{user.fullName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setLocation(getDashboardLink())}
                  data-testid="link-dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t("nav.dashboard")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>{t("nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" data-testid="link-nav-login">
                <Button variant="ghost" size="sm">
                  {t("nav.sign_in")}
                </Button>
              </Link>
              <Link href="/register" data-testid="link-nav-register">
                <Button size="sm">{t("nav.get_started")}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
