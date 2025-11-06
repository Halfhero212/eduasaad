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
import { Users, GraduationCap, BookOpen, UserCheck, Plus, Trash, Copy } from "lucide-react";
import type { User } from "@shared/schema";

export default function SuperAdminDashboard() {
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [deleteTeacherId, setDeleteTeacherId] = useState<number | null>(null);
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);

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

  const teachers = teachersData?.teachers || [];
  const students = studentsData?.students || [];
  const pendingEnrollments = pendingEnrollmentsData?.enrollments || [];

  const createTeacherMutation = useMutation({
    mutationFn: async (data: { fullName: string; email: string }) => {
      const res = await apiRequest("POST", "/api/auth/create-teacher", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setGeneratedPassword(data.password);
      setNewTeacherEmail("");
      setNewTeacherName("");
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

  const handleCreateTeacher = () => {
    if (!newTeacherName || !newTeacherEmail) {
      toast({
        title: t("dialog.create_teacher.validation_error"),
        description: t("dialog.create_teacher.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    createTeacherMutation.mutate({
      fullName: newTeacherName,
      email: newTeacherEmail,
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
                      <TableCell>${enrollment.course?.price}</TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTeacherId(teacher.id)}
                          data-testid={`button-delete-teacher-${teacher.id}`}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
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
      </div>
    </div>
  );
}
