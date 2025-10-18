import { Navbar } from "@/components/Navbar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CommentSection } from "@/components/CommentSection";
import { QuizCard } from "@/components/QuizCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Todo: Remove mock data
const mockUser = {
  name: "Ahmed Ali",
  role: "student" as const,
};

const mockLessons = [
  { id: 1, title: "Introduction to JavaScript", duration: "12:30", completed: true },
  { id: 2, title: "Variables and Data Types", duration: "15:45", completed: true },
  { id: 3, title: "Functions and Scope", duration: "18:20", completed: false },
  { id: 4, title: "Arrays and Objects", duration: "22:15", completed: false },
  { id: 5, title: "Loops and Iteration", duration: "16:40", completed: false },
  { id: 6, title: "Async Programming", duration: "24:30", completed: false },
];

const mockComments = [
  {
    id: 1,
    author: { name: "Ahmed Ali", role: "student" as const },
    content: "I don't understand the difference between let and const. Can you explain?",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    author: { name: "Dr. Ahmed Hassan", role: "teacher" as const },
    content: "Great question! 'let' allows you to reassign the variable, while 'const' creates a constant reference that cannot be reassigned. However, if const holds an object or array, you can still modify the contents.",
    timestamp: "1 hour ago",
    isReply: true,
  },
];

const mockQuiz = {
  id: 1,
  title: "Quiz 3: Functions and Closures",
  description: "Complete the exercises on JavaScript functions, closures, and scope. Upload your solutions as images.",
  lessonTitle: "Lesson 3: Functions and Scope",
  deadline: "Dec 25, 2024",
};

export default function LessonPlayer() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} notificationCount={3} onLogout={() => console.log('Logout')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player */}
        <div className="mb-8">
          <VideoPlayer
            videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            lessonTitle="Functions and Scope"
            courseTitle="Advanced JavaScript Programming"
            currentLesson={2}
            lessons={mockLessons}
            completed={false}
            onMarkComplete={() => console.log('Mark complete toggled')}
            onLessonChange={(id) => console.log('Changed to lesson:', id)}
            onPrevious={() => console.log('Previous lesson')}
            onNext={() => console.log('Next lesson')}
          />
        </div>

        {/* Tabs for Q&A and Quiz */}
        <Tabs defaultValue="qna" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="qna" data-testid="tab-qna">Q&A</TabsTrigger>
            <TabsTrigger value="quiz" data-testid="tab-quiz">Quiz</TabsTrigger>
          </TabsList>
          <TabsContent value="qna" className="mt-6">
            <CommentSection
              lessonId={3}
              comments={mockComments}
              userRole="student"
              onSubmitComment={(content) => console.log('New comment:', content)}
            />
          </TabsContent>
          <TabsContent value="quiz" className="mt-6">
            <div className="max-w-2xl">
              <QuizCard
                {...mockQuiz}
                onSubmit={(file) => console.log('Submitting quiz:', file.name)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
