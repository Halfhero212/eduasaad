import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, GraduationCap, BookOpen, UserCheck, Plus, Trash, Copy, Edit, FolderOpen, Key } from "lucide-react";
import type { User, CourseCategory } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";

export default function SuperAdminDashboard() {
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [deleteTeacherId, setDeleteTeacherId] = useState<number | null>(null);
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);
  const [resetPasswordTeacherId, setResetPasswordTeacherId] = useState<number | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Category management state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);

  const { data: statsData } = useQuery<{
    stats: {
      teacherCount: number;
      studentCount: number;
      courseCount: number;
      enrollmentCount: number;
    }
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: !isLoading && currentUser?.role === "superadmin",
  });

  const stats = statsData?.stats;

  const { data: teachersData } = useQuery<{ teachers: User[] }>({
    queryKey: ["/api/admin/teachers"],
    enabled: !isLoading && currentUser?.role === "superadmin",
  });

  const { data: studentsData } = useQuery<{ students: User[] }>({
    queryKey: ["/api/admin/students"],
    enabled: !isLoading && currentUser?.role === "superadmin",
  });

  const { data: pendingEnrollmentsData } = useQuery<{
    enrollments: Array<{
      id: number;
      student: { id: number; fullName: string; email: string } | null;
      course: { id: number; title: string; price: string } | null;
      teacher: { id: number; fullName: string; whatsappNumber: string | null } | null;
      enrolledAt: Date;
    }>;
  }>({
    queryKey: ["/api/admin/enrollments/pending"],
    enabled: !isLoading && currentUser?.role === "superadmin",
  });

  const { data: categoriesData } = useQuery<{ categories: CourseCategory[] }>({
    queryKey: ["/api/admin/categories"],
    enabled: !isLoading && currentUser?.role === "superadmin",
  });

  const { data: courseStatsData } = useQuery<{
    courses: Array<{
      id: number;
      title: string;
      teacher: { id: number; fullName: string; email: string } | null;
      categoryId: number;
      isFree: boolean;
      price: string;
      lessonCount: number;
      totalStudents: number;
      confirmedStudents: number;
      pendingStudents: number;
      freeStudents: number;
    }>;
  }>({
    queryKey: ["/api/admin/courses/stats"],
    enabled: !isLoading && currentUser?.role === "superadmin",
  });

  const { data: teacherStatsData } = useQuery<{
    teachers: Array<{
      id: number;
      fullName: string;
      email: string;
      whatsappNumber: string | null;
      courseCount: number;
      totalStudents: number;
      totalLessons: number;
      courses: Array<{
        id: number;
        title: string;
        lessonCount: number;
        studentCount: number;
        isFree: boolean;
        price: string;
      }>;
    }>;
  }>({
    queryKey: ["/api/admin/teachers/stats"],
    enabled: !isLoading && currentUser?.role === "superadmin",
  });

  const teachers = teachersData?.teachers || [];
  const students = studentsData?.students || [];
  const pendingEnrollments = pendingEnrollmentsData?.enrollments || [];
  const categories = categoriesData?.categories || [];
  const courseStats = courseStatsData?.courses || [];
  const teacherStats = teacherStatsData?.teachers || [];

  const createTeacherMutation = useMutation({
    mutationFn: async (data: { fullName: string; email: string; password?: string }) => {
      const res = await apiRequest("POST", "/api/auth/create-teacher", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setGeneratedPassword(data.password);
      setNewTeacherEmail("");
      setNewTeacherName("");
      setNewTeacherPassword("");
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("dialog.create_teacher.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteTeacherId(null);
      toast({
        title: t("dialog.delete.teacher_success"),
        description: t("dialog.delete.teacher_success_desc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("dialog.delete.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteStudentId(null);
      toast({
        title: t("dialog.delete.student_success"),
        description: t("dialog.delete.student_success_desc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("dialog.delete.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const confirmEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: number) => {
      await apiRequest("PUT", `/api/admin/enrollments/${enrollmentId}/status`, {
        status: "confirmed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: t("toast.enrollment_confirmed"),
        description: t("toast.enrollment_confirmed_desc"),
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

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      await apiRequest("POST", "/api/admin/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setCategoryDialogOpen(false);
      setCategoryName("");
      setCategoryDescription("");
      setEditingCategory(null);
      toast({
        title: t("toast.category_created"),
        description: t("toast.category_created_desc"),
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

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description?: string } }) => {
      await apiRequest("PUT", `/api/admin/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setCategoryDialogOpen(false);
      setCategoryName("");
      setCategoryDescription("");
      setEditingCategory(null);
      toast({
        title: t("toast.category_updated"),
        description: t("toast.category_updated_desc"),
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

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteCategoryId(null);
      toast({
        title: t("toast.category_deleted"),
        description: t("toast.category_deleted_desc"),
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

  const resetTeacherPasswordMutation = useMutation({
    mutationFn: async ({ teacherId, password }: { teacherId: number; password: string }) => {
      const res = await apiRequest("POST", `/api/admin/teachers/${teacherId}/reset-password`, { password });
      return await res.json();
    },
    onSuccess: () => {
      setResetPasswordDialogOpen(false);
      setResetPasswordTeacherId(null);
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: t("toast.password_reset_success"),
        description: t("toast.password_reset_teacher_desc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("toast.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
      setResetPasswordTeacherId(null);
    },
  });

  const handleResetTeacherPassword = (teacherId: number) => {
    setResetPasswordTeacherId(teacherId);
    setNewPassword("");
    setConfirmPassword("");
    setResetPasswordDialogOpen(true);
  };

  const handleConfirmResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: t("toast.failed"),
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: t("toast.failed"),
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (resetPasswordTeacherId) {
      resetTeacherPasswordMutation.mutate({ teacherId: resetPasswordTeacherId, password: newPassword });
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    const length = 12;
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTeacherPassword(password);
  };

  const handleCreateTeacher = () => {
    if (!newTeacherName || !newTeacherEmail) {
      toast({
        title: t("dialog.create_teacher.validation_error"),
        description: t("dialog.create_teacher.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    
    // Validate password if provided
    if (newTeacherPassword && newTeacherPassword.length < 8) {
      toast({
        title: t("dialog.create_teacher.validation_error"),
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    createTeacherMutation.mutate({
      fullName: newTeacherName,
      email: newTeacherEmail,
      password: newTeacherPassword || undefined, // Only send if provided
    });
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast({
        title: t("dialog.create_teacher.password_copied"),
        description: t("dialog.create_teacher.password_copied_desc"),
      });
    }
  };

  const handleOpenCategoryDialog = (category?: CourseCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description || "");
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDescription("");
    }
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      toast({
        title: t("toast.validation_error"),
        description: t("toast.category_name_required"),
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: {
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
        },
      });
    } else {
      createCategoryMutation.mutate({
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined,
      });
    }
  };

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== "superadmin")) {
      setLocation("/");
    }
  }, [isLoading, currentUser, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "superadmin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("dashboard.superadmin.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.superadmin.subtitle")}</p>
        </div>

        {/* Password Display Alert */}
        {generatedPassword && (
          <Alert className="mb-8 border-primary bg-primary/5" data-testid="alert-teacher-password">
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-lg mb-1">{t("dialog.create_teacher.success")}</p>
                  <p className="text-sm text-muted-foreground">{t("dialog.create_teacher.password_note")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">{t("dialog.create_teacher.password_label")}</Label>
                    <div className="mt-1 p-3 bg-background rounded-md border-2 border-primary">
                      <code className="text-2xl font-bold tracking-wider" data-testid="text-generated-password">{generatedPassword}</code>
                    </div>
                  </div>
                  <Button
                    onClick={handleCopyPassword}
                    variant="outline"
                    size="icon"
                    className="mt-5"
                    data-testid="button-copy-password"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => setGeneratedPassword(null)}
                  variant="secondary"
                  size="sm"
                  data-testid="button-close-password"
                >
                  {t("action.close")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.superadmin.total_teachers")}</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-teachers">{stats?.teacherCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.superadmin.total_students")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-students">{stats?.studentCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.superadmin.total_courses")}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-courses">{stats?.courseCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.superadmin.total_enrollments")}</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-enrollments">{stats?.enrollmentCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("dashboard.superadmin.course_stats")}</CardTitle>
            <CardDescription>{t("dashboard.superadmin.course_stats_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {courseStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("label.course")}</TableHead>
                    <TableHead>{t("label.teacher")}</TableHead>
                    <TableHead className="text-center">{t("label.lessons")}</TableHead>
                    <TableHead className="text-center">{t("label.total_students")}</TableHead>
                    <TableHead className="text-center">{t("label.confirmed")}</TableHead>
                    <TableHead className="text-center">{t("label.pending")}</TableHead>
                    <TableHead className="text-center">{t("label.free")}</TableHead>
                    <TableHead className="text-right">{t("label.price")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseStats.map((course) => (
                    <TableRow key={course.id} data-testid={`row-course-stats-${course.id}`}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>
                        <div>
                          <div>{course.teacher?.fullName}</div>
                          <div className="text-sm text-muted-foreground">{course.teacher?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{course.lessonCount}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" data-testid={`badge-total-students-${course.id}`}>
                          {course.totalStudents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" data-testid={`badge-confirmed-${course.id}`}>
                          {course.confirmedStudents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" data-testid={`badge-pending-${course.id}`}>
                          {course.pendingStudents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" data-testid={`badge-free-${course.id}`}>
                          {course.freeStudents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {course.isFree ? (
                          <Badge variant="secondary">{t("courses.free")}</Badge>
                        ) : (
                          `${course.price} ${t("courses.currency")}`
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("dashboard.superadmin.no_courses")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teacher Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("dashboard.superadmin.teacher_stats")}</CardTitle>
            <CardDescription>{t("dashboard.superadmin.teacher_stats_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {teacherStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("label.teacher")}</TableHead>
                    <TableHead className="text-center">{t("label.courses")}</TableHead>
                    <TableHead className="text-center">{t("label.total_students")}</TableHead>
                    <TableHead className="text-center">{t("label.total_lessons")}</TableHead>
                    <TableHead>{t("label.whatsapp")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherStats.map((teacher) => (
                    <TableRow key={teacher.id} data-testid={`row-teacher-stats-${teacher.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{teacher.fullName}</div>
                          <div className="text-sm text-muted-foreground">{teacher.email}</div>
                          {teacher.courses.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <div className="text-xs font-semibold text-muted-foreground">{t("label.course_details")}:</div>
                              {teacher.courses.map((course) => (
                                <div key={course.id} className="text-xs text-muted-foreground ml-2">
                                  • {course.title} ({course.lessonCount} {t("label.lessons")}, {course.studentCount} {t("label.students")})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" data-testid={`badge-courses-${teacher.id}`}>
                          {teacher.courseCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" data-testid={`badge-total-students-${teacher.id}`}>
                          {teacher.totalStudents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" data-testid={`badge-total-lessons-${teacher.id}`}>
                          {teacher.totalLessons}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {teacher.whatsappNumber ? (
                          <span className="text-sm">{teacher.whatsappNumber}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("dashboard.superadmin.no_teachers")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Enrollments Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("dashboard.superadmin.pending_enrollments")}</CardTitle>
            <CardDescription>{t("dashboard.superadmin.pending_enrollments_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingEnrollments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("label.student")}</TableHead>
                    <TableHead>{t("label.course")}</TableHead>
                    <TableHead>{t("label.teacher")}</TableHead>
                    <TableHead>{t("label.price")}</TableHead>
                    <TableHead>{t("label.enrolled_at")}</TableHead>
                    <TableHead>{t("label.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{enrollment.student?.fullName}</div>
                          <div className="text-sm text-muted-foreground">{enrollment.student?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.course?.title}</TableCell>
                      <TableCell>
                        <div>
                          <div>{enrollment.teacher?.fullName}</div>
                          {enrollment.teacher?.whatsappNumber && (
                            <div className="text-sm text-muted-foreground">
                              {enrollment.teacher.whatsappNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.course?.price} {t("courses.currency")}</TableCell>
                      <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => confirmEnrollmentMutation.mutate(enrollment.id)}
                          disabled={confirmEnrollmentMutation.isPending}
                          data-testid={`button-confirm-${enrollment.id}`}
                        >
                          {t("action.confirm")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("dashboard.superadmin.no_pending_enrollments")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Management */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.superadmin.categories")}</CardTitle>
              <CardDescription>{t("dashboard.superadmin.manage_categories")}</CardDescription>
            </div>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenCategoryDialog()} data-testid="button-create-category">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("dashboard.superadmin.create_category")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? t("dialog.category.edit_title") : t("dialog.category.create_title")}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory ? t("dialog.category.edit_description") : t("dialog.category.create_description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="category-name">{t("dialog.category.name")}</Label>
                    <Input
                      id="category-name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder={t("dialog.category.name_placeholder")}
                      data-testid="input-category-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">{t("dialog.category.description")}</Label>
                    <Textarea
                      id="category-description"
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      placeholder={t("dialog.category.description_placeholder")}
                      rows={3}
                      data-testid="input-category-description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSaveCategory}
                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                    data-testid="button-submit-category"
                  >
                    {createCategoryMutation.isPending || updateCategoryMutation.isPending
                      ? t("dialog.category.saving")
                      : editingCategory
                        ? t("dialog.category.update")
                        : t("dialog.category.create")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dialog.category.name")}</TableHead>
                    <TableHead>{t("dialog.category.description")}</TableHead>
                    <TableHead className="text-right">{t("label.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.description || <span className="italic">{t("label.no_description")}</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenCategoryDialog(category)}
                            data-testid={`button-edit-category-${category.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteCategoryId(category.id)}
                            data-testid={`button-delete-category-${category.id}`}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("dashboard.superadmin.no_categories")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers Management */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.superadmin.teachers")}</CardTitle>
              <CardDescription>{t("dashboard.superadmin.manage_teachers")}</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-teacher">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("dashboard.superadmin.create_teacher")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("dialog.create_teacher.title")}</DialogTitle>
                  <DialogDescription>
                    {t("dialog.create_teacher.description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">{t("dialog.create_teacher.full_name")}</Label>
                    <Input
                      id="name"
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-teacher-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("dialog.create_teacher.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newTeacherEmail}
                      onChange={(e) => setNewTeacherEmail(e.target.value)}
                      placeholder="teacher@example.com"
                      data-testid="input-teacher-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password (optional - leave empty to auto-generate)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        type="text"
                        value={newTeacherPassword}
                        onChange={(e) => setNewTeacherPassword(e.target.value)}
                        placeholder="Enter password or click generate"
                        data-testid="input-teacher-password"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateRandomPassword}
                        data-testid="button-generate-password"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 8 characters. Leave empty to auto-generate a secure password.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateTeacher}
                    disabled={createTeacherMutation.isPending}
                    data-testid="button-submit-teacher"
                  >
                    {createTeacherMutation.isPending ? t("dialog.create_teacher.creating") : t("dialog.create_teacher.create")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboard.superadmin.name")}</TableHead>
                  <TableHead>{t("dashboard.superadmin.email")}</TableHead>
                  <TableHead>{t("dashboard.superadmin.status")}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers && teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id} data-testid={`row-teacher-${teacher.id}`}>
                      <TableCell className="font-medium">{teacher.fullName}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t("dashboard.superadmin.active")}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetTeacherPassword(teacher.id)}
                            disabled={resetTeacherPasswordMutation.isPending && resetPasswordTeacherId === teacher.id}
                            data-testid={`button-reset-password-${teacher.id}`}
                            title={t("action.reset_password")}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTeacherId(teacher.id)}
                            data-testid={`button-delete-teacher-${teacher.id}`}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {t("dashboard.superadmin.no_teachers")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Students Management */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.superadmin.students")}</CardTitle>
            <CardDescription>{t("dashboard.superadmin.manage_students")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboard.superadmin.name")}</TableHead>
                  <TableHead>{t("dashboard.superadmin.email")}</TableHead>
                  <TableHead>{t("dashboard.superadmin.status")}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students && students.length > 0 ? (
                  students.map((student) => (
                    <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge>{t("dashboard.superadmin.active")}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteStudentId(student.id)}
                          data-testid={`button-delete-student-${student.id}`}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {t("dashboard.superadmin.no_students")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Teacher Confirmation Dialog */}
        <AlertDialog open={deleteTeacherId !== null} onOpenChange={(open) => !open && setDeleteTeacherId(null)}>
          <AlertDialogContent data-testid="dialog-delete-teacher">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("dialog.delete.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("dialog.delete.teacher_message")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-teacher">
                {t("dialog.delete.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTeacherId && deleteTeacherMutation.mutate(deleteTeacherId)}
                disabled={deleteTeacherMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-delete-teacher"
              >
                {deleteTeacherMutation.isPending ? t("dialog.delete.deleting") : t("dialog.delete.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Student Confirmation Dialog */}
        <AlertDialog open={deleteStudentId !== null} onOpenChange={(open) => !open && setDeleteStudentId(null)}>
          <AlertDialogContent data-testid="dialog-delete-student">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("dialog.delete.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("dialog.delete.student_message")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-student">
                {t("dialog.delete.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteStudentId && deleteStudentMutation.mutate(deleteStudentId)}
                disabled={deleteStudentMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-delete-student"
              >
                {deleteStudentMutation.isPending ? t("dialog.delete.deleting") : t("dialog.delete.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Category Confirmation Dialog */}
        <AlertDialog open={deleteCategoryId !== null} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
          <AlertDialogContent data-testid="dialog-delete-category">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("dialog.delete.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("dialog.delete.category_message")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-category">
                {t("dialog.delete.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteCategoryId && deleteCategoryMutation.mutate(deleteCategoryId)}
                disabled={deleteCategoryMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-delete-category"
              >
                {deleteCategoryMutation.isPending ? t("dialog.delete.deleting") : t("dialog.delete.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent data-testid="dialog-reset-password">
            <DialogHeader>
              <DialogTitle>{t("dialog.reset_password.title")}</DialogTitle>
              <DialogDescription>
                {t("dialog.reset_password.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("auth.new_password")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("auth.password_placeholder")}
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("auth.confirm_password")}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("auth.password_placeholder")}
                  data-testid="input-confirm-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => setResetPasswordDialogOpen(false)}
                data-testid="button-cancel-reset-password"
              >
                {t("action.cancel")}
              </Button>
              <Button 
                onClick={handleConfirmResetPassword}
                disabled={resetTeacherPasswordMutation.isPending}
                data-testid="button-confirm-reset-password"
              >
                {resetTeacherPasswordMutation.isPending ? t("action.resetting") : t("action.reset_password")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
