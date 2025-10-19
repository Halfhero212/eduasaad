import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, ChevronRight, ChevronLeft, MessageSquare } from "lucide-react";
import type { CourseLesson } from "@shared/schema";

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");

  const { data: lessonData, isLoading } = useQuery<{
    lesson: CourseLesson;
    course: { id: number; title: string };
    lessons: CourseLesson[];
    progress: { completed: boolean; lastPosition: number };
  }>({
    queryKey: ["/api/lessons", lessonId],
  });

  const { data: comments } = useQuery<Array<{
    id: number;
    content: string;
    userId: number;
    userName: string;
    userRole: string;
    createdAt: string;
  }>>({
    queryKey: ["/api/lessons", lessonId, "comments"],
    enabled: !!lessonId,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/lessons/${lessonId}/progress`, {
        completed: true,
        lastPosition: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons", lessonId] });
      toast({
        title: t("toast.lesson_completed"),
        description: t("toast.lesson_completed_desc"),
      });
    },
  });

  const submitCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/lessons/${lessonId}/comments`, { comment: content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons", lessonId, "comments"] });
      setNewComment("");
      toast({
        title: t("toast.question_posted"),
        description: t("toast.question_posted_desc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("toast.question_failed"),
        description: error instanceof Error ? error.message : t("toast.error_generic"),
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    submitCommentMutation.mutate(newComment);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full aspect-video mb-8" />
          <Skeleton className="h-8 w-3/4 mb-4" />
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("lesson.not_found")}</h1>
          <Link href={`/courses/${courseId}`}>
            <Button>{t("lesson.back_to_course")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { lesson, course, lessons = [], progress } = lessonData;
  const currentIndex = lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  
  const videoId = lesson.youtubeUrl?.includes("v=") 
    ? lesson.youtubeUrl.split("v=")[1].split("&")[0]
    : lesson.youtubeUrl?.split("/").pop();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href={`/courses/${courseId}`}>
            <span className="hover:text-foreground cursor-pointer">{course.title}</span>
          </Link>
          <span className="mx-2">→</span>
          <span>{lesson.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                {videoId ? (
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">{t("lesson.no_video")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="flex gap-2">
                  {prevLesson && (
                    <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}>
                      <Button variant="outline" data-testid="button-prev-lesson">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {t("lesson.previous")}
                      </Button>
                    </Link>
                  )}
                  {nextLesson && (
                    <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                      <Button variant="outline" data-testid="button-next-lesson">
                        {t("action.next")}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
                <Button
                  onClick={() => markCompleteMutation.mutate()}
                  disabled={progress.completed || markCompleteMutation.isPending}
                  variant={progress.completed ? "secondary" : "default"}
                  data-testid="button-mark-complete"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {progress.completed ? t("dashboard.student.completed") : t("lesson.mark_complete")}
                </Button>
              </CardContent>
            </Card>

            {/* Q&A Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t("comment.ask_question")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.role === "student" && (
                  <div className="space-y-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t("comment.ask_placeholder")}
                      rows={3}
                      data-testid="textarea-question"
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={submitCommentMutation.isPending || !newComment.trim()}
                      data-testid="button-submit-question"
                    >
                      {submitCommentMutation.isPending ? t("comment.posting") : t("comment.post_question")}
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4 mt-6">
                  {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border rounded-lg p-4"
                        data-testid={`comment-${comment.id}`}
                      >
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">
                            {comment.userName}{" "}
                            {comment.userRole === "teacher" && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                {t("comment.teacher_badge")}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t("comment.no_questions")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("courses.course_content")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lessons.map((l, index) => (
                  <Link key={l.id} href={`/courses/${courseId}/lessons/${l.id}`}>
                    <div
                      className={`p-3 rounded-lg cursor-pointer hover-elevate ${
                        l.id === lesson.id ? "bg-primary/10" : ""
                      }`}
                      data-testid={`sidebar-lesson-${l.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="font-medium text-sm">
                          {index + 1}. {l.title}
                        </div>
                      </div>
                      {l.durationMinutes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {l.durationMinutes} {t("courses.min")}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
