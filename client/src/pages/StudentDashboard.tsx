import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { CourseCard } from "@/components/CourseCard";
import { BookOpen, Award, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import programmingThumb from "@assets/generated_images/Programming_course_thumbnail_d3f5d2c9.png";
import mathThumb from "@assets/generated_images/Mathematics_course_thumbnail_0882555e.png";

// Todo: Remove mock data
const mockUser = {
  name: "Ahmed Ali",
  role: "student" as const,
};

const mockEnrolledCourses = [
  {
    id: 1,
    title: "Advanced JavaScript Programming",
    description: "Master modern JavaScript with ES6+, async/await, and advanced concepts",
    teacher: { name: "Dr. Ahmed Hassan", avatar: "A" },
    category: "Programming",
    price: 49,
    thumbnail: programmingThumb,
    lessonCount: 24,
    duration: "12h 30m",
    enrollmentCount: 342,
    enrolled: true,
    progress: 65,
  },
  {
    id: 2,
    title: "Calculus I - Complete Course",
    description: "Learn calculus from basics to advanced topics",
    teacher: { name: "Prof. Sarah Ali", avatar: "S" },
    category: "Mathematics",
    isFree: true,
    thumbnail: mathThumb,
    lessonCount: 18,
    duration: "8h 45m",
    enrollmentCount: 567,
    enrolled: true,
    progress: 100,
  },
  {
    id: 4,
    title: "Web Development Bootcamp",
    description: "Complete web development course covering HTML, CSS, JavaScript, React, and Node.js",
    teacher: { name: "Amira Saleh", avatar: "A" },
    category: "Programming",
    price: 99,
    thumbnail: programmingThumb,
    lessonCount: 48,
    duration: "25h 15m",
    enrollmentCount: 891,
    enrolled: true,
    progress: 23,
  },
];

const mockRecentActivity = [
  { lesson: "Functions and Closures", course: "Advanced JavaScript", time: "2 hours ago", progress: 65 },
  { lesson: "Integration Techniques", course: "Calculus I", time: "1 day ago", progress: 100 },
  { lesson: "CSS Grid Layout", course: "Web Development", time: "3 days ago", progress: 23 },
];

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} notificationCount={3} onLogout={() => console.log('Logout')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, {mockUser.name}!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Courses Enrolled"
            value="3"
            icon={BookOpen}
            gradient="from-primary to-chart-2"
          />
          <StatCard
            title="Lessons Completed"
            value="42"
            icon={Award}
            trend={{ value: "12%", isPositive: true }}
            gradient="from-chart-2 to-chart-3"
          />
          <StatCard
            title="Average Progress"
            value="62%"
            icon={Target}
            gradient="from-chart-3 to-chart-4"
          />
          <StatCard
            title="Quiz Average"
            value="89%"
            icon={TrendingUp}
            trend={{ value: "5%", isPositive: true }}
            gradient="from-chart-4 to-primary"
          />
        </div>

        {/* Continue Learning & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-heading font-bold mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockEnrolledCourses.slice(0, 2).map((course) => (
                <CourseCard
                  key={course.id}
                  {...course}
                  onClick={() => console.log('Continue course:', course.id)}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">{activity.lesson}</div>
                        <div className="text-muted-foreground text-xs">{activity.course}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                    <Progress value={activity.progress} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Enrolled Courses */}
        <div>
          <h2 className="text-xl font-heading font-bold mb-4">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEnrolledCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                onClick={() => console.log('Open course:', course.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
