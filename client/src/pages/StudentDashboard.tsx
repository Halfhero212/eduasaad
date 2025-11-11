import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Award, Target, PlayCircle } from "lucide-react";

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  thumbnailUrl: string | null;
  progress: number;
}

export default function StudentDashboard() {
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: enrollmentData } = useQuery<{ courses: EnrolledCourse[] }>({
    queryKey: ["/api/enrollments/my-courses"],
    enabled: !!currentUser && currentUser.role === "student",
  });

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== "student")) {
      setLocation("/");
    }
  }, [isLoading, currentUser, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "student") {
    return null;
  }

  const enrolledCourses = enrollmentData?.courses || [];
  const completedCourses = enrolledCourses.filter(c => c.progress === 100);
  const averageProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("dashboard.student.welcome")}, {currentUser.fullName}!</h1>
          <p className="text-muted-foreground">{t("dashboard.student.continue")}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.student.enrolled_courses")}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-enrolled">{enrolledCourses?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.student.completed")}</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-completed">{completedCourses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.student.avg_progress")}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-progress">{averageProgress}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.student.my_courses")}</CardTitle>
            <CardDescription>{t("dashboard.student.continue")}</CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledCourses && enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} data-testid={`card-course-${course.id}`} className="hover-elevate">
                    <CardHeader className="p-0">
                      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          {course.isFree ? (
                            <Badge variant="secondary" className="bg-secondary/90 backdrop-blur-sm">
                              {t("courses.free")}
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-primary/90 backdrop-blur-sm">
                              {course.price} {t("courses.currency")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mb-3">{course.description}</CardDescription>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("dashboard.student.progress")}</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Link href={`/courses/${course.id}`} data-testid={`link-continue-${course.id}`} className="w-full">
                        <Button variant="default" className="w-full">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {t("dashboard.student.continue_learning")}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t("dashboard.student.no_courses")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("dashboard.student.explore")}
                </p>
                <Link href="/">
                  <Button>
                    {t("nav.browse")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
