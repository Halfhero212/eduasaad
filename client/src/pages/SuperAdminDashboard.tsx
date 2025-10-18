import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import { BookOpen, Users, GraduationCap, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Todo: Remove mock data
const mockUser = {
  name: "Super Admin",
  role: "superadmin" as const,
};

const mockTeachers = [
  {
    id: 1,
    name: "Dr. Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    coursesCount: 5,
    studentsCount: 342,
    joinedDate: "Jan 15, 2024",
  },
  {
    id: 2,
    name: "Prof. Sarah Ali",
    email: "sarah.ali@example.com",
    coursesCount: 3,
    studentsCount: 567,
    joinedDate: "Feb 3, 2024",
  },
  {
    id: 3,
    name: "Mohammed Khalil",
    email: "mohammed.k@example.com",
    coursesCount: 8,
    studentsCount: 891,
    joinedDate: "Mar 12, 2024",
  },
];

const mockRecentActivity = [
  { action: "New Student Registration", user: "Layla Ibrahim", time: "5 mins ago", type: "student" },
  { action: "Course Created", user: "Dr. Ahmed Hassan", time: "2 hours ago", type: "course" },
  { action: "Course Purchase", user: "Omar Farid", time: "3 hours ago", type: "purchase" },
  { action: "Teacher Account Created", user: "Amira Saleh", time: "1 day ago", type: "teacher" },
];

const mockTopCourses = [
  { id: 1, title: "Web Development Bootcamp", enrollments: 891, revenue: 88209 },
  { id: 2, title: "Calculus I - Complete Course", enrollments: 567, revenue: 0 },
  { id: 3, title: "Advanced JavaScript", enrollments: 342, revenue: 16758 },
];

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} notificationCount={5} onLogout={() => console.log('Logout')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Platform Overview</h1>
          <p className="text-muted-foreground">Manage the entire learning platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value="2,543"
            icon={Users}
            trend={{ value: "18%", isPositive: true }}
            gradient="from-primary to-chart-2"
          />
          <StatCard
            title="Total Teachers"
            value="48"
            icon={GraduationCap}
            trend={{ value: "12%", isPositive: true }}
            gradient="from-chart-2 to-chart-3"
          />
          <StatCard
            title="Total Courses"
            value="156"
            icon={BookOpen}
            trend={{ value: "8%", isPositive: true }}
            gradient="from-chart-3 to-chart-4"
          />
          <StatCard
            title="Revenue (MTD)"
            value="$34.2K"
            icon={DollarSign}
            trend={{ value: "23%", isPositive: true }}
            gradient="from-chart-4 to-primary"
          />
        </div>

        {/* Platform Activity & Top Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Platform Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRecentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover-elevate" data-testid={`activity-${index}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'student' ? 'bg-chart-2' :
                    activity.type === 'teacher' ? 'bg-primary' :
                    activity.type === 'course' ? 'bg-chart-3' :
                    'bg-chart-4'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-sm">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">{activity.user}</div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTopCourses.map((course, index) => (
                <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg hover-elevate" data-testid={`top-course-${course.id}`}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{course.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {course.enrollments} enrollments
                      {course.revenue > 0 && ` • $${course.revenue.toLocaleString()} revenue`}
                    </div>
                  </div>
                  {course.revenue === 0 && (
                    <Badge variant="secondary">FREE</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Teacher Management */}
        <AdminUserManagement
          teachers={mockTeachers}
          onCreateTeacher={(name, email) => console.log('Creating teacher:', { name, email })}
        />
      </div>
    </div>
  );
}
