import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";
import type { Course } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@assets/stock_images/muslim_student_girl__ac85122a.jpg";
import collaborativeImage from "@assets/stock_images/muslim_student_girl__52e970b1.jpg";
import onlineCourseImage from "@assets/stock_images/muslim_student_girl__5ab02134.jpg";
import achievementImage from "@assets/stock_images/muslim_student_girl__ac85122a.jpg";

export default function Home() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{
    courses: Course[];
    categories: { id: number; name: string }[];
  }>({
    queryKey: ["/api/courses"],
  });

  const courses = coursesData?.courses || [];
  const categories = coursesData?.categories || [];

  const filteredCourses = courses.filter((course) =>
    selectedCategory === "all" || course.categoryId.toString() === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-accent text-primary-foreground py-20 md:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Students learning" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t("home.hero_title")}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              {t("home.hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" data-testid="link-hero-register">
                <Button size="lg" variant="default" className="bg-white text-primary hover:bg-white/90">
                  {t("home.get_started")}
                </Button>
              </Link>
              <Link href="/courses" data-testid="link-hero-courses">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-md">
                  {t("home.browse_courses")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">{courses?.length || 0}+</div>
              <div className="text-sm md:text-base opacity-90">{t("home.stats.courses")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">10k+</div>
              <div className="text-sm md:text-base opacity-90">{t("home.stats.students")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">50+</div>
              <div className="text-sm md:text-base opacity-90">{t("home.stats.teachers")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">4.8</div>
              <div className="text-sm md:text-base opacity-90">{t("home.stats.rating")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("home.how_it_works")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="overflow-hidden hover-elevate transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={collaborativeImage} 
                  alt={t("home.step1.title")} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2">
                    <GraduationCap className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{t("home.step1.title")}</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  {t("home.step1.description")}
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover-elevate transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={onlineCourseImage} 
                  alt={t("home.step2.title")} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2">
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{t("home.step2.title")}</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  {t("home.step2.description")}
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover-elevate transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={achievementImage} 
                  alt={t("home.step3.title")} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2">
                    <Award className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{t("home.step3.title")}</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  {t("home.step3.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Catalog */}
      <section id="courses" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("home.featured_courses")}</h2>
              <p className="text-muted-foreground">{t("courses.subtitle")}</p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              data-testid="button-category-all"
            >
              {t("courses.filter_all")}
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id.toString())}
                data-testid={`button-category-${category.id}`}
              >
                {t(`category.${category.name.toLowerCase()}`) !== `category.${category.name.toLowerCase()}` 
                  ? t(`category.${category.name.toLowerCase()}`) 
                  : category.name}
              </Button>
            ))}
          </div>

          {/* Course Grid */}
          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-40 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCourses && filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="hover-elevate transition-all overflow-hidden"
                  data-testid={`card-course-${course.id}`}
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {course.isFree ? (
                          <Badge variant="secondary" className="bg-secondary/90 backdrop-blur-sm">
                            {t("courses.free")}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-primary/90 backdrop-blur-sm">
                            ${course.price}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/courses/${course.id}`} data-testid={`link-course-${course.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        {t("home.view_course")}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("courses.no_courses")}</h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all"
                  ? t("home.no_courses_available")
                  : t("home.no_courses_category")}
              </p>
            </div>
          )}

          {/* View All Courses Button */}
          <div className="text-center mt-12">
            <Link href="/courses" data-testid="link-view-all-courses">
              <Button size="lg" variant="outline">
                {t("home.view_all")} →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
