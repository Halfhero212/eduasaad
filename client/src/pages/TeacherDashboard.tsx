import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { StudentProgressTable } from "@/components/StudentProgressTable";
import { BookOpen, Users, MessageSquare, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Todo: Remove mock data
const mockUser = {
  name: "Dr. Ahmed Hassan",
  role: "teacher" as const,
};

const mockStudents = [
  {
    id: 1,
    name: "Ahmed Ali",
    email: "ahmed@example.com",
    lessonsCompleted: 18,
    totalLessons: 24,
    quizzesSubmitted: 4,
    totalQuizzes: 6,
    avgScore: 92,
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Fatima Hassan",
    email: "fatima@example.com",
    lessonsCompleted: 24,
    totalLessons: 24,
    quizzesSubmitted: 6,
    totalQuizzes: 6,
    avgScore: 98,
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "Mohammed Khalil",
    email: "mohammed@example.com",
    lessonsCompleted: 12,
    totalLessons: 24,
    quizzesSubmitted: 3,
    totalQuizzes: 6,
    avgScore: 85,
    lastActive: "3 days ago",
  },
];

const mockPendingQuestions = [
  {
    id: 1,
    student: "Ahmed Ali",
    lesson: "Functions and Closures",
    question: "Can you explain the difference between call and apply methods?",
    time: "2 hours ago",
  },
  {
    id: 2,
    student: "Sara Mohammed",
    lesson: "Async/Await",
    question: "How do I handle multiple promises in parallel?",
    time: "5 hours ago",
  },
];

const mockPendingQuizzes = [
  {
    id: 1,
    student: "Fatima Hassan",
    quiz: "Quiz 5: Advanced Functions",
    submittedAt: "1 hour ago",
  },
  {
    id: 2,
    student: "Omar Khalid",
    quiz: "Quiz 4: Async Programming",
    submittedAt: "3 hours ago",
  },
];

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} notificationCount={7} onLogout={() => console.log('Logout')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and students</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My Courses"
            value="5"
            icon={BookOpen}
            gradient="from-primary to-chart-2"
          />
          <StatCard
            title="Total Students"
            value="342"
            icon={Users}
            trend={{ value: "12%", isPositive: true }}
            gradient="from-chart-2 to-chart-3"
          />
          <StatCard
            title="Pending Questions"
            value="8"
            icon={MessageSquare}
            gradient="from-chart-3 to-chart-4"
          />
          <StatCard
            title="Pending Quizzes"
            value="12"
            icon={Award}
            gradient="from-chart-4 to-primary"
          />
        </div>

        {/* Pending Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Questions</span>
                <Badge>{mockPendingQuestions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPendingQuestions.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg hover-elevate active-elevate-2 cursor-pointer" data-testid={`question-${item.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{item.student}</div>
                      <div className="text-xs text-muted-foreground">{item.lesson}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-sm line-clamp-2">{item.question}</p>
                  <Button size="sm" variant="outline" className="mt-2" data-testid={`button-answer-${item.id}`}>
                    Answer
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Quiz Reviews</span>
                <Badge>{mockPendingQuizzes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPendingQuizzes.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg hover-elevate active-elevate-2 cursor-pointer" data-testid={`quiz-${item.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{item.student}</div>
                      <div className="text-xs text-muted-foreground">{item.quiz}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.submittedAt}</span>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2" data-testid={`button-review-${item.id}`}>
                    Review Submission
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Student Progress Table */}
        <StudentProgressTable
          courseTitle="Advanced JavaScript Programming"
          students={mockStudents}
          onViewDetails={(id) => console.log('View student details:', id)}
        />
      </div>
    </div>
  );
}
