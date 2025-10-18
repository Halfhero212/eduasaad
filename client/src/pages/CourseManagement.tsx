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
import { Plus, Video, FileQuestion, ArrowLeft, Edit } from "lucide-react";
import type { Course, CourseLesson, Quiz } from "@shared/schema";

export default function CourseManagement() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addQuizOpen, setAddQuizOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const [newLesson, setNewLesson] = useState({
    title: "",
    youtubeUrl: "",
    durationMinutes: "",
  });

  const [newQuiz, setNewQuiz] = useState({
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
    queryKey: [`/api/lessons/${selectedLessonId}/quizzes`],
    enabled: !!selectedLessonId,
  });

  const addLessonMutation = useMutation({
    mutationFn: async (data: typeof newLesson) => {
      const lessonOrder = courseData?.lessons?.length || 0;
      await apiRequest("POST", `/api/courses/${id}/lessons`, {
        ...data,
        lessonOrder: lessonOrder + 1,
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("action.add_lesson")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                  <Card key={lesson.id} data-testid={`card-lesson-${lesson.id}`} className="hover-elevate">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="w-4 h-4 text-muted-foreground" />
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {t("label.lesson_order")}: {lesson.lessonOrder} • {lesson.durationMinutes} {t("label.minutes")}
                          </CardDescription>
                        </div>
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
                      </div>
                    </CardHeader>
                  </Card>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("action.add_quiz")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
      </div>
    </div>
  );
}
