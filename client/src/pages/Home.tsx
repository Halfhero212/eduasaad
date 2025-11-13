import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, Users, Award, Search, UserCheck, Trophy } from "lucide-react";
import type { Course } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCourseUrl } from "@/lib/courseUtils";
import { formatIQD } from "@/lib/utils";
import heroImage from "@assets/stock_images/books_learning_educa_0b5e5152.jpg";
import defaultThumbnail1 from "@assets/stock_images/books_learning_educa_d5ff243b.jpg";
import defaultThumbnail2 from "@assets/stock_images/notebook_pen_study_d_df2d2ad2.jpg";
import defaultThumbnail3 from "@assets/stock_images/open_book_pages_lear_0f2e0809.jpg";
import textbookImage from "@assets/stock_images/education_textbook_o_00e1a41c.jpg";
import pencilsImage from "@assets/stock_images/pencils_pens_school__89cf85ba.jpg";
import libraryImage from "@assets/stock_images/library_books_shelve_0b984042.jpg";

const defaultThumbnails = [defaultThumbnail1, defaultThumbnail2, defaultThumbnail3];

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
      <section className="relative text-primary-foreground py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Educational background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-accent/95"></div>
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
            <Card className="hover-elevate transition-all overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={textbookImage} 
                  alt="Browse courses" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <Search className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{t("home.step1.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("home.step1.description")}
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={pencilsImage} 
                  alt="Enroll in courses" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <UserCheck className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{t("home.step2.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("home.step2.description")}
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate transition-all overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={libraryImage} 
                  alt="Achieve success" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{t("home.step3.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("home.step3.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Highlight */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary-foreground rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-primary-foreground rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-primary-foreground rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Award className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("home.platform_highlight")}
            </h2>
            <p className="text-lg md:text-xl opacity-90">
              {t("home.platform_highlight_desc")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <GraduationCap className="w-5 h-5" />
                <span className="font-semibold">معلمون متميزون</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">جميع المواد الدراسية</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <Users className="w-5 h-5" />
                <span className="font-semibold">مختلف الصفوف الدراسية</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog */}
      <section id="courses" className="py-16 bg-muted/30">
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
              {filteredCourses.map((course, index) => (
                <Card
                  key={course.id}
                  className="hover-elevate transition-all overflow-hidden"
                  data-testid={`card-course-${course.id}`}
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-video">
                      <img
                        src={course.thumbnailUrl || defaultThumbnails[index % defaultThumbnails.length]}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {course.isFree ? (
                          <Badge variant="secondary" className="bg-secondary/90 backdrop-blur-sm">
                            {t("courses.free")}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-primary/90 backdrop-blur-sm">
                            {formatIQD(course.price, t("courses.currency"))}
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
                    <Link href={getCourseUrl(course.id, course.title)} data-testid={`link-course-${course.id}`} className="w-full">
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
