import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, BookOpen, Users, CheckCircle, PlayCircle, Lock, MessageSquare } from "lucide-react";
import type { Course, CourseLesson, User } from "@shared/schema";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: courseData, isLoading } = useQuery<{
    course: Course;
    teacher: User;
    lessons: CourseLesson[];
    isEnrolled: boolean;
  }>({
    queryKey: ["/api/courses", id],
  });

  const { data: whatsappNumber } = useQuery<{ whatsappNumber: string }>({
    queryKey: ["/api/whatsapp-number"],
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/courses/${id}/enroll`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id] });
      toast({
        title: "Enrollment successful",
        description: "You can now access the course content",
      });
    },
    onError: (error) => {
      toast({
        title: "Enrollment failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleWhatsAppEnroll = () => {
    if (!courseData) return;
    const message = encodeURIComponent(
      `Hi! I would like to enroll in "${courseData.course.title}" ($${courseData.course.price})`
    );
    const phone = whatsappNumber?.whatsappNumber || "9647801234567";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleFreeEnroll = () => {
    enrollMutation.mutate();
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
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { course, teacher, lessons, isEnrolled } = courseData;
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
                  <div className="font-medium">Created by {teacher?.fullName || "Unknown"}</div>
                  <div className="text-sm opacity-80">{teacher?.email || ""}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 opacity-90">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{lessons.length} lessons</span>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    {course.isFree ? (
                      <div className="text-4xl font-bold text-secondary">Free</div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">${course.price}</div>
                        <p className="text-sm text-muted-foreground">One-time payment</p>
                      </>
                    )}
                  </div>
                  
                  {isEnrolled ? (
                    <Link href={lessons.length > 0 ? `/courses/${course.id}/lessons/${lessons[0].id}` : "#"}>
                      <Button className="w-full" size="lg" data-testid="button-continue">
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Continue Learning
                      </Button>
                    </Link>
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
                          {enrollMutation.isPending ? "Enrolling..." : "Enroll for Free"}
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-[#25D366] hover:bg-[#20BA5A]"
                          size="lg"
                          onClick={handleWhatsAppEnroll}
                          data-testid="button-whatsapp"
                        >
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Buy via WhatsApp
                        </Button>
                      )}
                      {!isAuthenticated && (
                        <p className="text-xs text-muted-foreground text-center mt-3">
                          Please <Link href="/login"><span className="text-primary underline">sign in</span></Link> to enroll
                        </p>
                      )}
                    </>
                  )}
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
                  <CardTitle>What You'll Learn</CardTitle>
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
                <CardTitle>Course Content</CardTitle>
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
                            Lesson {index + 1}: {lesson.title}
                          </div>
                          {lesson.durationMinutes && (
                            <div className="text-sm text-muted-foreground">
                              {lesson.durationMinutes} min
                            </div>
                          )}
                        </div>
                      </div>
                      {isEnrolled && (
                        <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                          <Button variant="ghost" size="sm">Watch</Button>
                        </Link>
                      )}
                    </div>
                  ))}
                  {lessons.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No lessons available yet
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
                <CardTitle>Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {teacher.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-lg">{teacher.fullName}</div>
                    <div className="text-sm text-muted-foreground">{teacher.email}</div>
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
