import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatIQD } from "@/lib/utils";
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  Power,
  PowerOff,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  FileQuestion,
  ImageIcon,
} from "lucide-react";
import type { Course, Quiz } from "@shared/schema";

type EnrollmentStatus = "all" | "confirmed" | "pending" | "free";

type TeacherQuizSummary = {
  quiz: Quiz;
  course: { id: number; title: string };
  lesson: { id: number; title: string };
  submissionCount: number;
};

type QuizSubmissionDetail = {
  id: number;
  quizId: number;
  studentId: number;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  imageUrls: string[] | null;
  student: { id: number; fullName: string; email: string; whatsappNumber: string | null } | null;
};

export default function TeacherDashboard() {
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [enrollmentFilter, setEnrollmentFilter] = useState<EnrollmentStatus>("all");
  const [collapsedSections, setCollapsedSections] = useState({
    pending: false,
    enrollments: false,
    quizzes: false,
  });
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<{ id: number; title: string } | null>(null);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmissionDetail[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

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

  const { data: teacherQuizzesData, isFetching: isFetchingQuizzes } = useQuery<{ success: boolean; quizzes: TeacherQuizSummary[] }>({
    queryKey: ["/api/teacher/quizzes"],
    enabled: !isLoading && currentUser?.role === "teacher",
  });
  const teacherQuizzes = teacherQuizzesData?.quizzes || [];

  const groupedQuizzes = useMemo(() => {
    const courseMap = new Map<
      number,
      {
        course: { id: number; title: string };
        lessons: Map<number, { lesson: { id: number; title: string }; quizzes: TeacherQuizSummary[] }>;
      }
    >();

    for (const summary of teacherQuizzes) {
      if (!courseMap.has(summary.course.id)) {
        courseMap.set(summary.course.id, {
          course: summary.course,
          lessons: new Map(),
        });
      }
      const courseEntry = courseMap.get(summary.course.id)!;
      if (!courseEntry.lessons.has(summary.lesson.id)) {
        courseEntry.lessons.set(summary.lesson.id, {
          lesson: summary.lesson,
          quizzes: [],
        });
      }
      courseEntry.lessons.get(summary.lesson.id)!.quizzes.push(summary);
    }

    return Array.from(courseMap.values()).map((entry) => ({
      course: entry.course,
      lessons: Array.from(entry.lessons.values()),
    }));
  }, [teacherQuizzes]);

  const filteredEnrollments = enrollmentFilter === "all"
    ? allEnrollments
    : allEnrollments.filter((enrollment) => enrollment.purchaseStatus === enrollmentFilter);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const createCourseMutation = useMutation({
    mutationFn: async (data: typeof newCourse) => {
      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnailFile);
        const uploadRes = await fetch("/api/courses/upload-thumbnail", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
        price: data.isFree ? 0 : parseInt(data.price, 10),
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

  const toggleQuizStatusMutation = useMutation({
    mutationFn: async ({ quizId, isActive }: { quizId: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/quizzes/${quizId}/status`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/quizzes"] });
      toast({
        title: t("toast.quiz_updated"),
        description: t("toast.quiz_updated_desc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("toast.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: number) => {
      await apiRequest("DELETE", `/api/quizzes/${quizId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/quizzes"] });
      toast({
        title: t("toast.quiz_deleted"),
        description: t("toast.quiz_deleted_desc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("toast.failed"),
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
    const priceValue = parseInt(newCourse.price || "0", 10);
    if (!newCourse.isFree && (!priceValue || priceValue <= 0)) {
      toast({
        title: t("toast.validation_error"),
        description: t("toast.enter_valid_price"),
        variant: "destructive",
      });
      return;
    }
    createCourseMutation.mutate(newCourse);
  };

  const openQuizSubmissions = useCallback(async (quizId: number, quizTitle: string) => {
    setSubmissionsLoading(true);
    setSelectedQuiz({ id: quizId, title: quizTitle });
    try {
      const res = await apiRequest("GET", `/api/quizzes/${quizId}/submissions`);
      const data = await res.json();
      setQuizSubmissions((data?.submissions || []) as QuizSubmissionDetail[]);
      setSubmissionsDialogOpen(true);
    } catch (error) {
      toast({
        title: t("toast.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    } finally {
      setSubmissionsLoading(false);
    }
  }, [toast, t]);

  const handleToggleQuizStatus = (quizId: number, isActive: boolean) => {
    toggleQuizStatusMutation.mutate({ quizId, isActive });
  };

  const handleDeleteQuiz = (quizId: number) => {
    if (!window.confirm(t("quiz.confirm_delete"))) {
      return;
    }
    deleteQuizMutation.mutate(quizId);
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCourseQuery = useCallback(() => {
    if (!teacherQuizzes.length || !location.includes("focus=quizzes")) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("focus") === "quizzes") {
      const quizIdParam = params.get("quizId");
      if (quizIdParam) {
        const numericId = parseInt(quizIdParam, 10);
        const target = teacherQuizzes.find((entry) => entry.quiz.id === numericId);
        if (target) {
          openQuizSubmissions(target.quiz.id, target.quiz.title);
          params.delete("focus");
          params.delete("quizId");
          const newSearch = params.toString();
          window.history.replaceState({}, "", `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`);
        }
      }
    }
  }, [teacherQuizzes, location, openQuizSubmissions]);

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== "teacher")) {
      setLocation("/");
    }
  }, [isLoading, currentUser, setLocation]);

  useEffect(() => {
    handleCourseQuery();
  }, [handleCourseQuery]);

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
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("dashboard.teacher.title")}</h1>
            <p className="text-muted-foreground">{t("dashboard.teacher.manage_courses")}</p>
          </div>

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
                <div className="text-2xl font-bold">{allEnrollments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.teacher.total_enrollments")}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allEnrollments.length}</div>
              </CardContent>
            </Card>
          </div>

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
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {pendingEnrollments.length} {t("dashboard.teacher.pending")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSection("pending")}
                      aria-label={collapsedSections.pending ? t("action.show") : t("action.hide")}
                    >
                      {collapsedSections.pending ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {!collapsedSections.pending && (
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
                            {t("label.price")}:{" "}
                            {!enrollment.course?.price || Number(enrollment.course.price) === 0
                              ? t("courses.free")
                              : formatIQD(enrollment.course.price, t("courses.currency"))}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {t("dashboard.teacher.pending_approval")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

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
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    {allEnrollments.length} {t("dashboard.teacher.students")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSection("enrollments")}
                    aria-label={collapsedSections.enrollments ? t("action.show") : t("action.hide")}
                  >
                    {collapsedSections.enrollments ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {!collapsedSections.enrollments && (
              <CardContent>
                <Tabs value={enrollmentFilter} onValueChange={(value) => setEnrollmentFilter(value as EnrollmentStatus)} className="mb-4">
                  <TabsList data-testid="enrollment-filter-tabs">
                    <TabsTrigger value="all" data-testid="filter-all">
                      {t("dashboard.teacher.filter_all")} ({allEnrollments.length})
                    </TabsTrigger>
                    <TabsTrigger value="confirmed" data-testid="filter-confirmed">
                      {t("dashboard.teacher.filter_confirmed")} ({allEnrollments.filter((e) => e.purchaseStatus === "confirmed").length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" data-testid="filter-pending">
                      {t("dashboard.teacher.filter_pending")} ({allEnrollments.filter((e) => e.purchaseStatus === "pending").length})
                    </TabsTrigger>
                    <TabsTrigger value="free" data-testid="filter-free">
                      {t("dashboard.teacher.filter_free")} ({allEnrollments.filter((e) => e.purchaseStatus === "free").length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

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
                                enrollment.purchaseStatus === "confirmed"
                                  ? "default"
                                  : enrollment.purchaseStatus === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                              data-testid={`badge-status-${enrollment.id}`}
                            >
                              {enrollment.purchaseStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{enrollment.student?.email}</p>
                          {enrollment.student?.whatsappNumber && (
                            <p className="text-xs text-muted-foreground">
                              {enrollment.student.whatsappNumber}
                            </p>
                          )}
                          <p className="text-sm text-secondary mt-2">
                            {t("dashboard.teacher.course")}: {enrollment.course?.title || "Unknown Course"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("label.price")}:{" "}
                            {!enrollment.course?.price ||
                            Number(enrollment.course.price) === 0
                              ? t("courses.free")
                              : formatIQD(enrollment.course.price, t("courses.currency"))}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5" />
                    {t("dashboard.teacher.quizzes_section")}
                  </CardTitle>
                  <CardDescription>{t("dashboard.teacher.quizzes_section_desc")}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSection("quizzes")}
                  aria-label={collapsedSections.quizzes ? t("action.show") : t("action.hide")}
                >
                  {collapsedSections.quizzes ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.quizzes && (
              <CardContent>
                {isFetchingQuizzes && groupedQuizzes.length === 0 ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : groupedQuizzes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.teacher.no_quizzes")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {groupedQuizzes.map((courseGroup) => (
                      <div key={courseGroup.course.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{courseGroup.course.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {courseGroup.lessons.length} {t("courses.lessons")}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {courseGroup.lessons.map((lessonGroup) => (
                            <div
                              key={lessonGroup.lesson.id}
                              className="border rounded-lg p-3 bg-muted/40 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{lessonGroup.lesson.title}</p>
                                <Badge variant="outline">
                                  {lessonGroup.quizzes.length} {t("quiz.quizzes")}
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                {lessonGroup.quizzes.map(({ quiz, submissionCount }) => (
                                  <div
                                    key={quiz.id}
                                    className="rounded-lg border p-3 space-y-2 hover-elevate"
                                    data-testid={`teacher-quiz-${quiz.id}`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <p className="font-semibold">{quiz.title}</p>
                                        {quiz.description && (
                                          <p className="text-sm text-muted-foreground">{quiz.description}</p>
                                        )}
                                      </div>
                                      <Badge variant={quiz.isActive ? "default" : "secondary"}>
                                        {quiz.isActive
                                          ? t("dashboard.teacher.quiz_active")
                                          : t("dashboard.teacher.quiz_closed")}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <span className="text-sm text-muted-foreground">
                                        {submissionCount} {t("dashboard.teacher.students")}
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => openQuizSubmissions(quiz.id, quiz.title)}
                                          disabled={submissionsLoading && selectedQuiz?.id === quiz.id}
                                          data-testid={`button-view-quiz-${quiz.id}`}
                                        >
                                          {submissionsLoading && selectedQuiz?.id === quiz.id ? (
                                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                          ) : (
                                            <Eye className="w-4 h-4 mr-1" />
                                          )}
                                          {t("dashboard.teacher.view_submissions")} ({submissionCount})
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={quiz.isActive ? "secondary" : "outline"}
                                          onClick={() => handleToggleQuizStatus(quiz.id, !quiz.isActive)}
                                          disabled={toggleQuizStatusMutation.isPending}
                                          data-testid={`button-toggle-quiz-${quiz.id}`}
                                        >
                                          {toggleQuizStatusMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                          ) : quiz.isActive ? (
                                            <Power className="w-4 h-4 mr-1" />
                                          ) : (
                                            <PowerOff className="w-4 h-4 mr-1" />
                                          )}
                                          {quiz.isActive
                                            ? t("dashboard.teacher.close_quiz")
                                            : t("dashboard.teacher.reopen_quiz")}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDeleteQuiz(quiz.id)}
                                          disabled={deleteQuizMutation.isPending}
                                          data-testid={`button-delete-quiz-${quiz.id}`}
                                        >
                                          {deleteQuizMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                          ) : (
                                            <Trash2 className="w-4 h-4 mr-1" />
                                          )}
                                          {t("action.delete")}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("dashboard.teacher.create_course")}</DialogTitle>
                    <DialogDescription>
                      {t("dashboard.teacher.manage_courses")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="course-title">{t("label.course_title")} *</Label>
                      <Input
                        id="course-title"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        placeholder={t("placeholder.course_title")}
                        data-testid="input-course-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-description">{t("label.course_description")}</Label>
                      <Textarea
                        id="course-description"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        placeholder={t("placeholder.course_description")}
                        rows={3}
                        data-testid="input-course-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-learn">{t("courses.what_you_learn")}</Label>
                      <Textarea
                        id="course-learn"
                        value={newCourse.whatYouWillLearn}
                        onChange={(e) => setNewCourse({ ...newCourse, whatYouWillLearn: e.target.value })}
                        placeholder={t("placeholder.what_you_learn")}
                        rows={3}
                        data-testid="input-course-learn"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="category">{t("label.category")}</Label>
                        <Select
                          value={newCourse.categoryId}
                          onValueChange={(value) => setNewCourse({ ...newCourse, categoryId: value })}
                          data-testid="select-category"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("label.category")} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price">{t("label.price")}</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newCourse.price}
                          onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                          placeholder={t("placeholder.price")}
                          min="0"
                          step="1000"
                          disabled={newCourse.isFree}
                          data-testid="input-price"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            id="is-free"
                            type="checkbox"
                            checked={newCourse.isFree}
                            onChange={(e) => setNewCourse({ ...newCourse, isFree: e.target.checked })}
                            data-testid="checkbox-is-free"
                          />
                          <Label htmlFor="is-free">{t("courses.free")}</Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="thumbnail">{t("label.course_thumbnail")}</Label>
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        data-testid="input-thumbnail"
                      />
                      {thumbnailPreview && (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="mt-2 w-full h-40 object-cover rounded-md border"
                        />
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
                          {course.isFree ? t("courses.free") : formatIQD(course.price ?? 0, t("courses.currency"))}
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

      <Dialog open={submissionsDialogOpen} onOpenChange={setSubmissionsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.teacher.submissions_title")}
              {selectedQuiz ? ` - ${selectedQuiz.title}` : ""}
            </DialogTitle>
          </DialogHeader>
          {submissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : quizSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("dashboard.teacher.no_submissions")}
            </p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {quizSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {submission.student?.fullName || t("dashboard.teacher.students")}
                      </p>
                      {submission.student?.email && (
                        <p className="text-sm text-muted-foreground">
                          {submission.student.email}
                        </p>
                      )}
                      {submission.student?.whatsappNumber && (
                        <p className="text-xs text-muted-foreground">
                          {submission.student.whatsappNumber}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  {submission.score !== null && (
                    <p className="text-sm font-medium">
                      {t("quiz.score")}: {submission.score}%
                    </p>
                  )}
                  {submission.feedback && (
                    <p className="text-sm text-muted-foreground">
                      {t("quiz.feedback")}: {submission.feedback}
                    </p>
                  )}
                  {submission.imageUrls && submission.imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {submission.imageUrls!.map((url, index) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {t("quiz.view_image")} {submission.imageUrls!.length > 1 ? index + 1 : ""}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmissionsDialogOpen(false)}>
              {t("action.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
