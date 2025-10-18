import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lesson {
  id: string | number;
  title: string;
  duration: string;
  completed?: boolean;
}

interface VideoPlayerProps {
  videoUrl: string;
  lessonTitle: string;
  courseTitle: string;
  currentLesson: number;
  lessons: Lesson[];
  completed?: boolean;
  onMarkComplete?: () => void;
  onLessonChange?: (lessonId: string | number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function VideoPlayer({
  videoUrl,
  lessonTitle,
  courseTitle,
  currentLesson,
  lessons,
  completed = false,
  onMarkComplete,
  onLessonChange,
  onPrevious,
  onNext,
}: VideoPlayerProps) {
  const [isCompleted, setIsCompleted] = useState(completed);

  const handleMarkComplete = () => {
    setIsCompleted(!isCompleted);
    onMarkComplete?.();
    console.log('Lesson marked as', !isCompleted ? 'complete' : 'incomplete');
  };

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Video Area */}
      <div className="lg:col-span-2 space-y-4">
        {/* Video Player */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {videoId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lessonTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Invalid video URL
            </div>
          )}
        </div>

        {/* Lesson Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1" data-testid="text-course-title">
                {courseTitle}
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2" data-testid="text-lesson-title">
                {lessonTitle}
              </h1>
            </div>
            <Badge variant={isCompleted ? "default" : "secondary"} className="ml-4">
              {isCompleted ? "Completed" : "In Progress"}
            </Badge>
          </div>

          {/* Navigation & Mark Complete */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentLesson === 0}
              data-testid="button-previous-lesson"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={onNext}
              disabled={currentLesson === lessons.length - 1}
              data-testid="button-next-lesson"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Checkbox
                id="mark-complete"
                checked={isCompleted}
                onCheckedChange={handleMarkComplete}
                data-testid="checkbox-mark-complete"
              />
              <label htmlFor="mark-complete" className="text-sm font-medium cursor-pointer">
                Mark as complete
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Lessons</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-1 p-4 pt-0">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => onLessonChange?.(lesson.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors hover-elevate active-elevate-2 ${
                      index === currentLesson
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                    data-testid={`button-lesson-${lesson.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        {lesson.completed ? (
                          <CheckCircle className="h-5 w-5 text-chart-3" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm mb-1 line-clamp-2">
                          Lesson {index + 1}: {lesson.title}
                        </div>
                        <div className="text-xs opacity-70">{lesson.duration}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
