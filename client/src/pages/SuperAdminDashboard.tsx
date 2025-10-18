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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, GraduationCap, BookOpen, UserCheck, Plus } from "lucide-react";
import type { User } from "@shared/schema";

export default function SuperAdminDashboard() {
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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

  const teachers = teachersData?.teachers || [];
  const students = studentsData?.students || [];

  const createTeacherMutation = useMutation({
    mutationFn: async (data: { fullName: string; email: string }) => {
      const res = await apiRequest("POST", "/api/auth/create-teacher", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Teacher created successfully",
        description: `Password: ${data.password}. Please save this password and share it with the teacher.`,
      });
      setNewTeacherEmail("");
      setNewTeacherName("");
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create teacher",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleCreateTeacher = () => {
    if (!newTeacherName || !newTeacherEmail) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createTeacherMutation.mutate({
      fullName: newTeacherName,
      email: newTeacherEmail,
    });
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {t("dashboard.superadmin.no_students")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
