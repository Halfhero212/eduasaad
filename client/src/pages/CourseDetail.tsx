import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, BookOpen, Users, CheckCircle, PlayCircle, Lock, MessageSquare, Share2 } from "lucide-react";
import type { Course, CourseLesson, User } from "@shared/schema";
import { getCourseUrl, getCourseLessonUrl } from "@/lib/courseUtils";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: courseData, isLoading } = useQuery<{
    course: Course & { teacher: (User & { whatsappNumber?: string | null }) | null };
    lessons: CourseLesson[];
    isEnrolled: boolean;
    enrollmentStatus: string | null;
  }>({
    queryKey: ["/api/courses", id],
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/courses/${id}/enroll`, {});
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id] });
      
      // Show different messages for free vs paid courses
      if (data.purchaseStatus === "free") {
        toast({
          title: t("toast.enrollment_success"),
          description: t("toast.enrollment_success_desc"),
        });
      } else {
        toast({
          title: t("toast.enrollment_pending"),
          description: t("toast.enrollment_pending_desc"),
        });
      }
    },
    onError: (error) => {
      toast({
        title: t("toast.enrollment_failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const handleWhatsAppEnroll = async () => {
    if (!courseData) return;
    
    // Prepare WhatsApp link using teacher's WhatsApp number
    const messageTemplate = t("courses.whatsapp_message");
    const message = encodeURIComponent(
      messageTemplate
        .replace("{title}", courseData.course.title)
        .replace("{price}", `${courseData.course.price} ${t("courses.currency")}`)
    );
    const phone = courseData.course.teacher?.whatsappNumber || "9467730145334";
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    
    // Open WhatsApp window immediately (before async operation) to avoid popup blocking
    const whatsappWindow = window.open("about:blank", "_blank");
    
    // Check if popup was blocked
    if (!whatsappWindow) {
      toast({
        title: t("toast.popup_blocked"),
        description: t("toast.popup_blocked_desc"),
        variant: "destructive",
      });
      return;
    }
    
    // Then create the enrollment with pending status
    try {
      await enrollMutation.mutateAsync();
      
      // Update the opened window to WhatsApp
      whatsappWindow.location.href = whatsappUrl;
    } catch (error) {
      // Close the window if enrollment failed
      whatsappWindow.close();
      // Error already handled by mutation onError
      console.error("Enrollment failed:", error);
    }
  };

  const handleFreeEnroll = () => {
    enrollMutation.mutate();
  };

  const handleShareCourse = () => {
    if (!course) return;
    const courseUrl = `${window.location.origin}${getCourseUrl(course.id, course.title)}`;
    navigator.clipboard.writeText(courseUrl).then(() => {
      toast({
        title: t("toast.link_copied"),
        description: t("toast.link_copied_desc"),
      });
    }).catch(() => {
      toast({
        title: t("toast.failed"),
        description: t("toast.error_generic"),
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("courses.not_found")}</h1>
          <Link href="/">
            <Button>{t("courses.back_to_home")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { course, lessons, isEnrolled, enrollmentStatus } = courseData;
  const teacher = course.teacher;
  const whatYouWillLearnPoints = course.whatYouWillLearn?.split("\n").filter(Boolean) || [];

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  const getTeacherName = () => teacher?.fullName || t("courses.unknown");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Course Hero */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg opacity-90 mb-6">{course.description}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-white text-primary">
                    {getInitials(teacher?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{t("courses.created_by")} {getTeacherName()}</div>
                  <div className="text-sm opacity-80">{teacher?.email || ""}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 opacity-90">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{lessons.length} {t("courses.lessons")}</span>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    {course.isFree ? (
                      <div className="text-4xl font-bold text-secondary">{t("courses.free")}</div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">{course.price} {t("courses.currency")}</div>
                        <p className="text-sm text-muted-foreground">{t("courses.one_time_payment")}</p>
                      </>
                    )}
                  </div>
                  
                  {isEnrolled ? (
                    <Link href={lessons.length > 0 ? getCourseLessonUrl(course.id, course.title, lessons[0].id) : "#"}>
                      <Button className="w-full" size="lg" data-testid="button-continue">
                        <PlayCircle className="h-5 w-5 mr-2" />
                        {t("courses.continue_learning")}
                      </Button>
                    </Link>
                  ) : enrollmentStatus === "pending" ? (
                    <Button
                      className="w-full"
                      size="lg"
                      disabled
                      variant="secondary"
                      data-testid="button-already-applied"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {t("courses.already_applied")}
                    </Button>
                  ) : (
                    <>
                      {course.isFree ? (
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleFreeEnroll}
                          disabled={enrollMutation.isPending || !isAuthenticated}
                          data-testid="button-enroll-free"
                        >
                          {enrollMutation.isPending ? t("courses.enrolling") : t("courses.enroll_free")}
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-[#25D366] hover:bg-[#20BA5A]"
                          size="lg"
                          onClick={handleWhatsAppEnroll}
                          disabled={enrollMutation.isPending || !isAuthenticated}
                          data-testid="button-whatsapp"
                        >
                          <MessageSquare className="h-5 w-5 mr-2" />
                          {enrollMutation.isPending ? t("courses.enrolling") : t("courses.buy_whatsapp")}
                        </Button>
                      )}
                      {!isAuthenticated && (
                        <p className="text-xs text-muted-foreground text-center mt-3">
                          {t("courses.sign_in_to_enroll")} <Link href="/login"><span className="text-primary underline">{t("auth.sign_in")}</span></Link>
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Share Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={handleShareCourse}
                    data-testid="button-share-course"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t("courses.share_course")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            {whatYouWillLearnPoints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("courses.what_you_learn")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {whatYouWillLearnPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Content / Lessons */}
            <Card>
              <CardHeader>
                <CardTitle>{t("courses.course_content")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                      data-testid={`lesson-${lesson.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {isEnrolled ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium">
                            {t("courses.lesson_label")} {index + 1}: {lesson.title}
                          </div>
                          {lesson.durationMinutes && (
                            <div className="text-sm text-muted-foreground">
                              {lesson.durationMinutes} {t("courses.min")}
                            </div>
                          )}
                        </div>
                      </div>
                      {isEnrolled && (
                        <Link href={getCourseLessonUrl(course.id, course.title, lesson.id)}>
                          <Button variant="ghost" size="sm">{t("courses.watch")}</Button>
                        </Link>
                      )}
                    </div>
                  ))}
                  {lessons.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {t("courses.no_lessons")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Teacher Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("courses.your_instructor")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(teacher?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-lg">{getTeacherName()}</div>
                    <div className="text-sm text-muted-foreground">{teacher?.email || ""}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
