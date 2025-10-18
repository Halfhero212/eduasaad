import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatsAppPurchaseButton } from "@/components/WhatsAppPurchaseButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, BookOpen, Users, CheckCircle, PlayCircle, Lock } from "lucide-react";
import programmingThumb from "@assets/generated_images/Programming_course_thumbnail_d3f5d2c9.png";

// Todo: Remove mock data
const mockUser = {
  name: "Ahmed Ali",
  role: "student" as const,
};

const mockCourse = {
  id: 1,
  title: "Advanced JavaScript Programming",
  description: "Master modern JavaScript with ES6+, async/await, promises, and advanced programming concepts. This comprehensive course will take you from intermediate to advanced level with real-world projects and hands-on exercises.",
  teacher: {
    name: "Dr. Ahmed Hassan",
    avatar: "A",
    bio: "Senior Software Engineer with 10+ years of experience in web development and JavaScript frameworks.",
  },
  category: "Programming",
  price: 49,
  thumbnail: programmingThumb,
  duration: "12h 30m",
  lessonCount: 24,
  enrollmentCount: 342,
  enrolled: false,
  whatYouWillLearn: [
    "Master ES6+ features including arrow functions, destructuring, and spread operators",
    "Understand asynchronous programming with Promises and async/await",
    "Learn advanced concepts like closures, prototypes, and the event loop",
    "Build real-world projects using modern JavaScript best practices",
    "Implement design patterns and write clean, maintainable code",
    "Work with APIs and handle data fetching efficiently",
  ],
  lessons: [
    { id: 1, title: "Introduction to Modern JavaScript", duration: "12:30", free: true },
    { id: 2, title: "ES6+ Features Overview", duration: "15:45", free: true },
    { id: 3, title: "Functions and Closures", duration: "18:20", free: false },
    { id: 4, title: "Arrays and Objects Deep Dive", duration: "22:15", free: false },
    { id: 5, title: "Asynchronous JavaScript", duration: "24:30", free: false },
    { id: 6, title: "Working with APIs", duration: "20:15", free: false },
  ],
};

export default function CourseDetail() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} notificationCount={3} onLogout={() => console.log('Logout')} />

      {/* Course Hero */}
      <div className="relative bg-gradient-to-r from-primary to-chart-2 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <img src={mockCourse.thumbnail} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge className="mb-4 bg-background/20 text-primary-foreground backdrop-blur-sm">
                {mockCourse.category}
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                {mockCourse.title}
              </h1>
              <p className="text-lg text-primary-foreground/90 mb-6">
                {mockCourse.description}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-background text-foreground">
                    {mockCourse.teacher.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Created by {mockCourse.teacher.name}</div>
                  <div className="text-sm text-primary-foreground/80">
                    {mockCourse.teacher.bio}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-primary-foreground/90">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{mockCourse.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{mockCourse.lessonCount} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{mockCourse.enrollmentCount} students</span>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold mb-2">${mockCourse.price}</div>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>
                  {mockCourse.enrolled ? (
                    <Button className="w-full mb-3" size="lg" data-testid="button-continue">
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <WhatsAppPurchaseButton
                      courseName={mockCourse.title}
                      price={mockCourse.price}
                    />
                  )}
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Contact us via WhatsApp to complete your purchase
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-heading font-bold mb-4">What you'll learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockCourse.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-heading font-bold mb-4">Course Content</h2>
                <div className="space-y-2">
                  {mockCourse.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer"
                      data-testid={`lesson-${lesson.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {lesson.free || mockCourse.enrolled ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-sm">
                            Lesson {index + 1}: {lesson.title}
                          </div>
                          {lesson.free && !mockCourse.enrolled && (
                            <Badge variant="secondary" className="mt-1">Free Preview</Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Teacher Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading font-bold mb-4">Your Instructor</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground text-xl">
                      {mockCourse.teacher.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{mockCourse.teacher.name}</div>
                    <div className="text-sm text-muted-foreground">Teacher</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockCourse.teacher.bio}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
