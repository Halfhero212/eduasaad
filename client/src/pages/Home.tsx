import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import programmingThumb from "@assets/generated_images/Programming_course_thumbnail_d3f5d2c9.png";
import mathThumb from "@assets/generated_images/Mathematics_course_thumbnail_0882555e.png";
import scienceThumb from "@assets/generated_images/Science_course_thumbnail_7fb355da.png";

// Todo: Remove mock data
const mockCourses = [
  {
    id: 1,
    title: "Advanced JavaScript Programming",
    description: "Master modern JavaScript with ES6+, async/await, and advanced concepts for building real-world applications",
    teacher: { name: "Dr. Ahmed Hassan", avatar: "A" },
    category: "Programming",
    price: 49,
    thumbnail: programmingThumb,
    lessonCount: 24,
    duration: "12h 30m",
    enrollmentCount: 342,
  },
  {
    id: 2,
    title: "Calculus I - Complete Course",
    description: "Learn calculus from basics to advanced topics with real-world applications and problem solving",
    teacher: { name: "Prof. Sarah Ali", avatar: "S" },
    category: "Mathematics",
    isFree: true,
    thumbnail: mathThumb,
    lessonCount: 18,
    duration: "8h 45m",
    enrollmentCount: 567,
  },
  {
    id: 3,
    title: "Introduction to Chemistry",
    description: "Explore the fundamentals of chemistry including atomic structure, chemical bonds, and reactions",
    teacher: { name: "Dr. Mohammed Khalil", avatar: "M" },
    category: "Science",
    price: 39,
    thumbnail: scienceThumb,
    lessonCount: 20,
    duration: "10h 15m",
    enrollmentCount: 234,
  },
  {
    id: 4,
    title: "Web Development Bootcamp",
    description: "Complete web development course covering HTML, CSS, JavaScript, React, and Node.js from scratch",
    teacher: { name: "Amira Saleh", avatar: "A" },
    category: "Programming",
    price: 99,
    thumbnail: programmingThumb,
    lessonCount: 48,
    duration: "25h 15m",
    enrollmentCount: 891,
  },
  {
    id: 5,
    title: "Linear Algebra Fundamentals",
    description: "Master vectors, matrices, and linear transformations with practical applications",
    teacher: { name: "Dr. Omar Farid", avatar: "O" },
    category: "Mathematics",
    isFree: true,
    thumbnail: mathThumb,
    lessonCount: 16,
    duration: "7h 30m",
    enrollmentCount: 423,
  },
  {
    id: 6,
    title: "Physics for Engineers",
    description: "Comprehensive physics course covering mechanics, thermodynamics, and electromagnetism",
    teacher: { name: "Prof. Layla Ibrahim", avatar: "L" },
    category: "Science",
    price: 59,
    thumbnail: scienceThumb,
    lessonCount: 32,
    duration: "16h 45m",
    enrollmentCount: 312,
  },
];

const categories = ["All", "Programming", "Mathematics", "Science"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = mockCourses.filter((course) => {
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <HeroSection onSearch={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold mb-4">Browse Courses</h2>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} data-testid={`tab-${category.toLowerCase()}`}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              {...course}
              onClick={() => console.log('Navigate to course:', course.id)}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No courses found</p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
