import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Video, FileQuestion, ArrowLeft, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Course, CourseLesson, Quiz } from "@shared/schema";

export default function CourseManagement() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [editLessonOpen, setEditLessonOpen] = useState(false);
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);
  const [addQuizOpen, setAddQuizOpen] = useState(false);
  const [editQuizOpen, setEditQuizOpen] = useState(false);
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [newLesson, setNewLesson] = useState({
    title: "",
    youtubeUrl: "",
    durationMinutes: "",
  });

  const [editLesson, setEditLesson] = useState({
    title: "",
    youtubeUrl: "",
    durationMinutes: "",
  });

  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const [editQuiz, setEditQuiz] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const { data: courseData, isLoading: courseLoading } = useQuery<{
    course: Course & { teacher: { id: number; fullName: string; email: string } | null };
    lessons: CourseLesson[];
  }>({
    queryKey: [`/api/courses/${id}`],
    enabled: !isLoading && !!id,
  });

  const { data: quizzesData } = useQuery<{ quizzes: Quiz[] }>({
    queryKey: [`/api/lessons/${expandedLessonId}/quizzes`],
    enabled: !!expandedLessonId,
  });

  const addLessonMutation = useMutation({
    mutationFn: async (data: typeof newLesson) => {
      // Find the highest lesson order and add 1 to ensure correct sequencing
      const maxLessonOrder = courseData?.lessons?.reduce((max, lesson) => 
        Math.max(max, lesson.lessonOrder), 0) || 0;
      await apiRequest("POST", `/api/courses/${id}/lessons`, {
        ...data,
        lessonOrder: maxLessonOrder + 1,
        durationMinutes: parseInt(data.durationMinutes) || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}`] });
      toast({
        title: t("toast.lesson_added"),
        description: t("toast.lesson_added_desc"),
      });
      setNewLesson({ title: "", youtubeUrl: "", durationMinutes: "" });
      setAddLessonOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("toast.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const addQuizMutation = useMutation({
    mutationFn: async (data: typeof newQuiz) => {
      await apiRequest("POST", "/api/quizzes", {
        lessonId: selectedLessonId,
        ...data,
        deadline: data.deadline || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lessons/${selectedLessonId}/quizzes`] });
      toast({
        title: t("toast.quiz_created"),
        description: t("toast.quiz_created_desc"),
      });
      setNewQuiz({ title: "", description: "", deadline: "" });
      setAddQuizOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("toast.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const editLessonMutation = useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: number; data: typeof editLesson }) => {
      await apiRequest("PUT", `/api/lessons/${lessonId}`, {
        ...data,
        durationMinutes: parseInt(data.durationMinutes) || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}`] });
      toast({
        title: t("toast.lesson_updated"),
        description: t("toast.lesson_updated_desc"),
      });
      setEditLessonOpen(false);
      setEditingLesson(null);
    },
    onError: (error) => {
      toast({
        title: t("toast.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      await apiRequest("DELETE", `/api/lessons/${lessonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}`] });
      toast({
        title: t("toast.lesson_deleted"),
        description: t("toast.lesson_deleted_desc"),
      });
      // Reset expanded state if the deleted lesson was expanded
      if (expandedLessonId === deleteLessonId) {
        setExpandedLessonId(null);
      }
      // Reset selected state if the deleted lesson was selected
      if (selectedLessonId === deleteLessonId) {
        setSelectedLessonId(null);
      }
      setDeleteLessonId(null);
    },
    onError: (error) => {
      toast({
        title: t("toast.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const editQuizMutation = useMutation({
    mutationFn: async ({ quizId, data }: { quizId: number; data: typeof editQuiz }) => {
      await apiRequest("PUT", `/api/quizzes/${quizId}`, {
        ...data,
        deadline: data.deadline || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lessons/${selectedLessonId}/quizzes`] });
      toast({
        title: t("toast.quiz_updated"),
        description: t("toast.quiz_updated_desc"),
      });
      setEditQuizOpen(false);
      setEditingQuiz(null);
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
      queryClient.invalidateQueries({ queryKey: [`/api/lessons/${selectedLessonId}/quizzes`] });
      toast({
        title: t("toast.quiz_deleted"),
        description: t("toast.quiz_deleted_desc"),
      });
      setDeleteQuizId(null);
    },
    onError: (error) => {
      toast({
        title: t("toast.failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const handleAddLesson = () => {
    if (!newLesson.title || !newLesson.youtubeUrl) {
      toast({
        title: t("dialog.create_teacher.validation_error"),
        description: t("dialog.create_teacher.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    addLessonMutation.mutate(newLesson);
  };

  const handleAddQuiz = () => {
    if (!newQuiz.title || !newQuiz.description) {
      toast({
        title: t("dialog.create_teacher.validation_error"),
        description: t("dialog.create_teacher.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    addQuizMutation.mutate(newQuiz);
  };

  const handleEditLesson = () => {
    if (!editLesson.title || !editLesson.youtubeUrl || !editingLesson) {
      toast({
        title: t("dialog.create_teacher.validation_error"),
        description: t("dialog.create_teacher.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    editLessonMutation.mutate({ lessonId: editingLesson.id, data: editLesson });
  };

  const handleEditQuiz = () => {
    if (!editQuiz.title || !editQuiz.description || !editingQuiz) {
      toast({
        title: t("dialog.create_teacher.validation_error"),
        description: t("dialog.create_teacher.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    editQuizMutation.mutate({ quizId: editingQuiz.id, data: editQuiz });
  };

  const openEditLessonDialog = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setEditLesson({
      title: lesson.title,
      youtubeUrl: lesson.youtubeUrl,
      durationMinutes: lesson.durationMinutes?.toString() || "",
    });
    setEditLessonOpen(true);
  };

  const openEditQuizDialog = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setEditQuiz({
      title: quiz.title,
      description: quiz.description,
      deadline: quiz.deadline ? (typeof quiz.deadline === 'string' ? quiz.deadline : new Date(quiz.deadline).toISOString().slice(0, 16)) : "",
    });
    setEditQuizOpen(true);
  };

  useEffect(() => {
    if (!isLoading && !courseLoading && courseData) {
      if (!currentUser || currentUser.role !== "teacher") {
        setLocation("/");
        return;
      }
      if (courseData.course.teacher?.id !== currentUser.id) {
        setLocation("/dashboard/teacher");
      }
    }
  }, [isLoading, courseLoading, currentUser, courseData, setLocation]);

  if (isLoading || courseLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>{t("courses.not_found")}</p>
        </div>
      </div>
    );
  }

  const { course, lessons } = courseData;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard/teacher">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("action.back")}
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-muted-foreground mb-4">{course.description}</p>
          <div className="flex gap-2">
            <Badge>{course.isFree ? t("courses.free") : `$${course.price}`}</Badge>
            <Link href={`/courses/${course.id}`}>
              <Button variant="outline" size="sm" data-testid="button-view-public">
                <Edit className="w-4 h-4 mr-2" />
                {t("action.view_public")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Lessons Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("courses.lessons")} ({lessons.length})</CardTitle>
              <CardDescription>{t("manage.lessons_desc")}</CardDescription>
            </div>
            <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-lesson">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("action.add_lesson")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("action.add_lesson")}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                  <div>
                    <Label htmlFor="lesson-title">{t("label.lesson_title")} *</Label>
                    <Input
                      id="lesson-title"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      placeholder={t("placeholder.lesson_title")}
                      data-testid="input-lesson-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube-url">{t("label.youtube_url")} *</Label>
                    <Input
                      id="youtube-url"
                      value={newLesson.youtubeUrl}
                      onChange={(e) => setNewLesson({ ...newLesson, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      data-testid="input-youtube-url"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">{t("label.duration_minutes")}</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newLesson.durationMinutes}
                      onChange={(e) => setNewLesson({ ...newLesson, durationMinutes: e.target.value })}
                      placeholder="30"
                      min="0"
                      data-testid="input-duration"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddLesson}
                    disabled={addLessonMutation.isPending}
                    data-testid="button-submit-lesson"
                  >
                    {addLessonMutation.isPending ? t("action.submit") : t("action.add_lesson")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {lessons && lessons.length > 0 ? (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <Collapsible
                    key={lesson.id}
                    open={expandedLessonId === lesson.id}
                    onOpenChange={(open) => setExpandedLessonId(open ? lesson.id : null)}
                  >
                    <Card data-testid={`card-lesson-${lesson.id}`} className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="w-4 h-4 text-muted-foreground" />
                              <CardTitle className="text-lg">{lesson.title}</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                              {t("label.lesson_order")}: {lesson.lessonOrder} • {lesson.durationMinutes} {t("label.minutes")}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid={`button-toggle-quizzes-${lesson.id}`}
                              >
                                {expandedLessonId === lesson.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditLessonDialog(lesson)}
                              data-testid={`button-edit-lesson-${lesson.id}`}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {t("action.edit")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLessonId(lesson.id);
                                setAddQuizOpen(true);
                              }}
                              data-testid={`button-add-quiz-${lesson.id}`}
                            >
                              <FileQuestion className="w-4 h-4 mr-2" />
                              {t("action.add_quiz")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteLessonId(lesson.id)}
                              data-testid={`button-delete-lesson-${lesson.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-3">{t("manage.quizzes")}</h4>
                            {expandedLessonId === lesson.id && quizzesData && quizzesData.quizzes.length > 0 ? (
                              <div className="space-y-2">
                                {quizzesData.quizzes.map((quiz) => (
                                  <div
                                    key={quiz.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                    data-testid={`quiz-item-${quiz.id}`}
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium">{quiz.title}</p>
                                      <p className="text-sm text-muted-foreground">{quiz.description}</p>
                                      {quiz.deadline && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {t("label.deadline")}: {new Date(quiz.deadline).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditQuizDialog(quiz)}
                                        data-testid={`button-edit-quiz-${quiz.id}`}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteQuizId(quiz.id)}
                                        data-testid={`button-delete-quiz-${quiz.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : expandedLessonId === lesson.id ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                {t("manage.no_quizzes")}
                              </p>
                            ) : null}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("manage.no_lessons")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Quiz Dialog */}
        <Dialog open={addQuizOpen} onOpenChange={setAddQuizOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("action.add_quiz")}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              <div>
                <Label htmlFor="quiz-title">{t("label.quiz_title")} *</Label>
                <Input
                  id="quiz-title"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  placeholder={t("placeholder.quiz_title")}
                  data-testid="input-quiz-title"
                />
              </div>
              <div>
                <Label htmlFor="quiz-description">{t("label.quiz_description")} *</Label>
                <Textarea
                  id="quiz-description"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  placeholder={t("placeholder.quiz_description")}
                  rows={4}
                  data-testid="input-quiz-description"
                />
              </div>
              <div>
                <Label htmlFor="deadline">{t("label.deadline")}</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={newQuiz.deadline}
                  onChange={(e) => setNewQuiz({ ...newQuiz, deadline: e.target.value })}
                  data-testid="input-deadline"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddQuiz}
                disabled={addQuizMutation.isPending}
                data-testid="button-submit-quiz"
              >
                {addQuizMutation.isPending ? t("action.submit") : t("action.add_quiz")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Lesson Dialog */}
        <Dialog open={editLessonOpen} onOpenChange={setEditLessonOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("action.edit_lesson")}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              <div>
                <Label htmlFor="edit-title">{t("label.lesson_title")} *</Label>
                <Input
                  id="edit-title"
                  value={editLesson.title}
                  onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })}
                  placeholder={t("placeholder.lesson_title")}
                  data-testid="input-edit-lesson-title"
                />
              </div>
              <div>
                <Label htmlFor="edit-url">{t("label.youtube_url")} *</Label>
                <Input
                  id="edit-url"
                  value={editLesson.youtubeUrl}
                  onChange={(e) => setEditLesson({ ...editLesson, youtubeUrl: e.target.value })}
                  placeholder={t("placeholder.youtube_url")}
                  data-testid="input-edit-youtube-url"
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">{t("label.duration_minutes")}</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editLesson.durationMinutes}
                  onChange={(e) => setEditLesson({ ...editLesson, durationMinutes: e.target.value })}
                  placeholder="30"
                  min="0"
                  data-testid="input-edit-duration"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditLessonOpen(false)}
                data-testid="button-cancel-edit-lesson"
              >
                {t("action.cancel")}
              </Button>
              <Button
                onClick={handleEditLesson}
                disabled={editLessonMutation.isPending}
                data-testid="button-save-edit-lesson"
              >
                {editLessonMutation.isPending ? t("action.save") : t("action.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Lesson Confirmation Dialog */}
        <AlertDialog open={deleteLessonId !== null} onOpenChange={(open) => !open && setDeleteLessonId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("action.confirm_delete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirm.delete_lesson")}
                <br />
                {t("confirm.delete_warning")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-lesson">
                {t("action.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteLessonId && deleteLessonMutation.mutate(deleteLessonId)}
                disabled={deleteLessonMutation.isPending}
                data-testid="button-confirm-delete-lesson"
              >
                {deleteLessonMutation.isPending ? t("action.delete") : t("action.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Quiz Dialog */}
        <Dialog open={editQuizOpen} onOpenChange={setEditQuizOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("action.edit_quiz")}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              <div>
                <Label htmlFor="edit-quiz-title">{t("label.quiz_title")} *</Label>
                <Input
                  id="edit-quiz-title"
                  value={editQuiz.title}
                  onChange={(e) => setEditQuiz({ ...editQuiz, title: e.target.value })}
                  placeholder={t("placeholder.quiz_title")}
                  data-testid="input-edit-quiz-title"
                />
              </div>
              <div>
                <Label htmlFor="edit-quiz-description">{t("label.quiz_description")} *</Label>
                <Textarea
                  id="edit-quiz-description"
                  value={editQuiz.description}
                  onChange={(e) => setEditQuiz({ ...editQuiz, description: e.target.value })}
                  placeholder={t("placeholder.quiz_description")}
                  rows={4}
                  data-testid="input-edit-quiz-description"
                />
              </div>
              <div>
                <Label htmlFor="edit-deadline">{t("label.deadline")}</Label>
                <Input
                  id="edit-deadline"
                  type="datetime-local"
                  value={editQuiz.deadline}
                  onChange={(e) => setEditQuiz({ ...editQuiz, deadline: e.target.value })}
                  data-testid="input-edit-deadline"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditQuizOpen(false)}
                data-testid="button-cancel-edit-quiz"
              >
                {t("action.cancel")}
              </Button>
              <Button
                onClick={handleEditQuiz}
                disabled={editQuizMutation.isPending}
                data-testid="button-save-edit-quiz"
              >
                {editQuizMutation.isPending ? t("action.save") : t("action.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Quiz Confirmation Dialog */}
        <AlertDialog open={deleteQuizId !== null} onOpenChange={(open) => !open && setDeleteQuizId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("action.confirm_delete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirm.delete_quiz")}
                <br />
                {t("confirm.delete_warning")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-quiz">
                {t("action.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteQuizId && deleteQuizMutation.mutate(deleteQuizId)}
                disabled={deleteQuizMutation.isPending}
                data-testid="button-confirm-delete-quiz"
              >
                {deleteQuizMutation.isPending ? t("action.delete") : t("action.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
