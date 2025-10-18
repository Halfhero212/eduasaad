import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BookOpen, Plus, Users, TrendingUp } from "lucide-react";
import type { Course } from "@shared/schema";

export default function TeacherDashboard() {
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    whatYouWillLearn: "",
    categoryId: "",
    price: "",
    isFree: false,
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/my-courses"],
    enabled: !isLoading && currentUser?.role === "teacher",
  });

  const { data: categories } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/courses/categories"],
    enabled: !isLoading && currentUser?.role === "teacher",
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: typeof newCourse) => {
      const res = await apiRequest("POST", "/api/courses", {
        ...data,
        categoryId: parseInt(data.categoryId),
        price: data.isFree ? 0 : parseFloat(data.price),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-courses"] });
      toast({
        title: "Course created successfully",
        description: "You can now add lessons to your course",
      });
      setNewCourse({
        title: "",
        description: "",
        whatYouWillLearn: "",
        categoryId: "",
        price: "",
        isFree: false,
      });
      setCreateCourseOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create course",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.description || !newCourse.categoryId) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (!newCourse.isFree && (!newCourse.price || parseFloat(newCourse.price) <= 0)) {
      toast({
        title: "Validation error",
        description: "Please enter a valid price or mark the course as free",
        variant: "destructive",
      });
      return;
    }
    createCourseMutation.mutate(newCourse);
  };

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== "teacher")) {
      setLocation("/");
    }
  }, [isLoading, currentUser, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "teacher") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("dashboard.teacher.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.teacher.manage_courses")}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.teacher.my_courses")}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-courses">{courses?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.teacher.students")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.teacher.total_enrollments")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.teacher.my_courses")}</CardTitle>
              <CardDescription>{t("dashboard.teacher.manage_courses")}</CardDescription>
            </div>
            <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-course">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("dashboard.teacher.create_course")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("dashboard.teacher.create_course")}</DialogTitle>
                  <DialogDescription>
                    {t("dashboard.teacher.manage_courses")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">{t("courses.title")} *</Label>
                    <Input
                      id="title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="Introduction to Web Development"
                      data-testid="input-course-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">{t("courses.filter_all")} *</Label>
                    <Select
                      value={newCourse.categoryId}
                      onValueChange={(value) => setNewCourse({ ...newCourse, categoryId: value })}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder={t("courses.filter_all")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">{t("courses.subtitle")} *</Label>
                    <Textarea
                      id="description"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      placeholder="A comprehensive course that covers..."
                      rows={3}
                      data-testid="input-course-description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatYouWillLearn">{t("courses.what_you_learn")}</Label>
                    <Textarea
                      id="whatYouWillLearn"
                      value={newCourse.whatYouWillLearn}
                      onChange={(e) => setNewCourse({ ...newCourse, whatYouWillLearn: e.target.value })}
                      placeholder="Build web applications\nUnderstand JavaScript\nWork with APIs"
                      rows={3}
                      data-testid="input-course-learn"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isFree"
                        checked={newCourse.isFree}
                        onChange={(e) => setNewCourse({ ...newCourse, isFree: e.target.checked })}
                        data-testid="checkbox-is-free"
                      />
                      <Label htmlFor="isFree">{t("courses.free")}</Label>
                    </div>
                    {!newCourse.isFree && (
                      <div className="flex-1">
                        <Label htmlFor="price">{t("courses.paid")} *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newCourse.price}
                          onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                          placeholder="49.99"
                          min="0"
                          step="0.01"
                          data-testid="input-course-price"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateCourse}
                    disabled={createCourseMutation.isPending}
                    data-testid="button-submit-course"
                  >
                    {createCourseMutation.isPending ? t("action.submit") : t("dashboard.teacher.create_course")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} data-testid={`card-course-${course.id}`} className="hover-elevate">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {course.isFree ? t("courses.free") : `$${course.price}`}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/courses/${course.id}`} className="w-full" data-testid={`link-manage-${course.id}`}>
                        <Button variant="outline" className="w-full">
                          {t("action.edit")}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t("dashboard.teacher.no_courses")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("dashboard.teacher.get_started")}
                </p>
                <Button onClick={() => setCreateCourseOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("dashboard.teacher.create_course")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
