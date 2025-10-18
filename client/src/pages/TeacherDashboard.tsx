import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
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
import { BookOpen, Plus, Users, Edit } from "lucide-react";
import type { Course } from "@shared/schema";

export default function TeacherDashboard() {
  const { user: currentUser, isLoading } = useAuth();
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
          <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and lessons</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-courses">{courses?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Manage your courses and lessons</CardDescription>
            </div>
            <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-course">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new course
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="Introduction to Web Development"
                      data-testid="input-course-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newCourse.categoryId}
                      onValueChange={(value) => setNewCourse({ ...newCourse, categoryId: value })}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
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
                    <Label htmlFor="description">Description *</Label>
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
                    <Label htmlFor="whatYouWillLearn">What You Will Learn</Label>
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
                      <Label htmlFor="isFree">Free Course</Label>
                    </div>
                    {!newCourse.isFree && (
                      <div className="flex-1">
                        <Label htmlFor="price">Price (USD) *</Label>
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
                    {createCourseMutation.isPending ? "Creating..." : "Create Course"}
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
                        {course.isFree ? "Free" : `$${course.price}`}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/courses/${course.id}`} className="w-full" data-testid={`link-manage-${course.id}`}>
                        <Button variant="outline" className="w-full">
                          Manage Course
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first course to start teaching
                </p>
                <Button onClick={() => setCreateCourseOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
