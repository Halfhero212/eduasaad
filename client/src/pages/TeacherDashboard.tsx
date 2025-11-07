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
import { BookOpen, Plus, Users, TrendingUp, Clock, Check, X, Upload, ImageIcon, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@shared/schema";

type EnrollmentStatus = "all" | "confirmed" | "pending" | "free";

export default function TeacherDashboard() {
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [enrollmentFilter, setEnrollmentFilter] = useState<EnrollmentStatus>("all");
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    whatYouWillLearn: "",
    categoryId: "",
    price: "",
    isFree: false,
  });

  const { data: coursesData } = useQuery<{ courses: (Course & { lessonCount: number; enrollmentCount: number })[] }>({
    queryKey: ["/api/my-courses"],
    enabled: !isLoading && currentUser?.role === "teacher",
  });

  const courses = coursesData?.courses;

  const { data: categories } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/courses/categories"],
    enabled: !isLoading && currentUser?.role === "teacher",
  });

  const { data: pendingEnrollmentsData } = useQuery<{
    enrollments: Array<{
      id: number;
      enrolledAt: Date;
      purchaseStatus: string;
      student: { id: number; fullName: string; email: string } | null;
      course: { id: number; title: string; price: string } | null;
    }>;
  }>({
    queryKey: ["/api/enrollments/teacher/pending"],
    enabled: !isLoading && currentUser?.role === "teacher",
  });

  const pendingEnrollments = pendingEnrollmentsData?.enrollments || [];

  const { data: allEnrollmentsData } = useQuery<{
    enrollments: Array<{
      id: number;
      enrolledAt: Date;
      purchaseStatus: string;
      student: { id: number; fullName: string; email: string; whatsappNumber: string | null } | null;
      course: { id: number; title: string; price: string } | null;
    }>;
  }>({
    queryKey: ["/api/enrollments/teacher/all"],
    enabled: !isLoading && currentUser?.role === "teacher",
  });

  const allEnrollments = allEnrollmentsData?.enrollments || [];
  
  // Filter enrollments based on selected filter
  const filteredEnrollments = enrollmentFilter === "all" 
    ? allEnrollments 
    : allEnrollments.filter(e => e.purchaseStatus === enrollmentFilter);

  const confirmEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: number) => {
      await apiRequest("PUT", `/api/enrollments/${enrollmentId}/status`, { status: "confirmed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/teacher/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/teacher/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-courses"] });
      toast({
        title: t("toast.enrollment_confirmed"),
        description: t("toast.enrollment_confirmed_desc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("toast.enrollment_update_failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("toast.validation_error"),
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createCourseMutation = useMutation({
    mutationFn: async (data: typeof newCourse) => {
      let thumbnailUrl = null;
      
      // Upload thumbnail if provided
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnailFile);
        
        const uploadRes = await fetch("/api/courses/upload-thumbnail", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error("Failed to upload thumbnail");
        }
        
        const uploadData = await uploadRes.json();
        thumbnailUrl = uploadData.url;
      }
      
      const res = await apiRequest("POST", "/api/courses", {
        ...data,
        categoryId: parseInt(data.categoryId),
        price: data.isFree ? 0 : parseFloat(data.price),
        thumbnailUrl,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-courses"] });
      toast({
        title: t("toast.course_created"),
        description: t("toast.course_created_desc"),
      });
      setNewCourse({
        title: "",
        description: "",
        whatYouWillLearn: "",
        categoryId: "",
        price: "",
        isFree: false,
      });
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setCreateCourseOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("toast.course_create_failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.description || !newCourse.categoryId) {
      toast({
        title: t("toast.validation_error"),
        description: t("toast.fill_required_fields"),
        variant: "destructive",
      });
      return;
    }
    if (!newCourse.isFree && (!newCourse.price || parseFloat(newCourse.price) <= 0)) {
      toast({
        title: t("toast.validation_error"),
        description: t("toast.enter_valid_price"),
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

        {/* Pending Enrollments */}
        {pendingEnrollments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t("dashboard.teacher.pending_enrollments")}
                  </CardTitle>
                  <CardDescription>{t("dashboard.teacher.pending_enrollments_desc")}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {pendingEnrollments.length} {t("dashboard.teacher.pending")}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`enrollment-pending-${enrollment.id}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{enrollment.student?.fullName || "Unknown Student"}</h4>
                      <p className="text-sm text-muted-foreground">{enrollment.student?.email}</p>
                      <p className="text-sm text-secondary mt-1">
                        {t("dashboard.teacher.course")}: {enrollment.course?.title || "Unknown Course"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("label.price")}: ${enrollment.course?.price || "0"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => confirmEnrollmentMutation.mutate(enrollment.id)}
                        disabled={confirmEnrollmentMutation.isPending}
                        data-testid={`button-confirm-${enrollment.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {t("button.confirm")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Enrollments with Filtering */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("dashboard.teacher.all_enrollments")}
                </CardTitle>
                <CardDescription>{t("dashboard.teacher.all_enrollments_desc")}</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {allEnrollments.length} {t("dashboard.teacher.students")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            <Tabs value={enrollmentFilter} onValueChange={(value) => setEnrollmentFilter(value as EnrollmentStatus)} className="mb-4">
              <TabsList data-testid="enrollment-filter-tabs">
                <TabsTrigger value="all" data-testid="filter-all">
                  {t("dashboard.teacher.filter_all")} ({allEnrollments.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" data-testid="filter-confirmed">
                  {t("dashboard.teacher.filter_confirmed")} ({allEnrollments.filter(e => e.purchaseStatus === "confirmed").length})
                </TabsTrigger>
                <TabsTrigger value="pending" data-testid="filter-pending">
                  {t("dashboard.teacher.filter_pending")} ({allEnrollments.filter(e => e.purchaseStatus === "pending").length})
                </TabsTrigger>
                <TabsTrigger value="free" data-testid="filter-free">
                  {t("dashboard.teacher.filter_free")} ({allEnrollments.filter(e => e.purchaseStatus === "free").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Enrollments List */}
            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">{t("dashboard.teacher.no_enrollments")}</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard.teacher.no_enrollments_desc")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover-elevate"
                    data-testid={`enrollment-${enrollment.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{enrollment.student?.fullName || "Unknown Student"}</h4>
                        <Badge 
                          variant={
                            enrollment.purchaseStatus === "confirmed" ? "default" : 
                            enrollment.purchaseStatus === "pending" ? "secondary" : 
                            "outline"
                          }
                          data-testid={`badge-status-${enrollment.id}`}
                        >
                          {enrollment.purchaseStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{enrollment.student?.email}</p>
                      {enrollment.student?.whatsappNumber && (
                        <p className="text-sm text-muted-foreground">
                          {t("dashboard.teacher.student_phone")}: {enrollment.student.whatsappNumber}
                        </p>
                      )}
                      <p className="text-sm text-secondary mt-2">
                        {t("dashboard.teacher.course")}: {enrollment.course?.title || "Unknown Course"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("label.price")}: ${enrollment.course?.price || "0"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    {enrollment.purchaseStatus === "pending" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => confirmEnrollmentMutation.mutate(enrollment.id)}
                        disabled={confirmEnrollmentMutation.isPending}
                        data-testid={`button-confirm-enrollment-${enrollment.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {t("button.confirm")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                    <Label htmlFor="title">{t("label.course_title")} *</Label>
                    <Input
                      id="title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder={t("placeholder.course_title")}
                      data-testid="input-course-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">{t("label.category")} *</Label>
                    <Select
                      value={newCourse.categoryId}
                      onValueChange={(value) => setNewCourse({ ...newCourse, categoryId: value })}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder={t("label.category")} />
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
                    <Label htmlFor="description">{t("label.description")} *</Label>
                    <Textarea
                      id="description"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      placeholder={t("placeholder.course_description")}
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
                      placeholder={t("placeholder.what_you_learn")}
                      rows={3}
                      data-testid="input-course-learn"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">{t("label.course_thumbnail")}</Label>
                    <div className="mt-2">
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="w-full h-48 object-cover rounded-md border"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setThumbnailFile(null);
                              setThumbnailPreview(null);
                            }}
                            data-testid="button-remove-thumbnail"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Label
                          htmlFor="thumbnail"
                          className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-md cursor-pointer hover-elevate transition-all"
                          data-testid="label-upload-thumbnail"
                        >
                          <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload course thumbnail</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </Label>
                      )}
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        data-testid="input-thumbnail"
                      />
                    </div>
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
                        <Label htmlFor="price">{t("label.price")} *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newCourse.price}
                          onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                          placeholder={t("placeholder.price")}
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
                      <Link href={`/manage/courses/${course.id}`} className="w-full" data-testid={`link-manage-${course.id}`}>
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
