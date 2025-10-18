import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import heroImage from "@assets/generated_images/Hero_banner_education_scene_a56203c1.png";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    console.log('Search:', searchQuery);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Students learning" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-chart-2/90"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6" data-testid="text-hero-title">
            Master New Skills with Iraqi's Top Teachers
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8" data-testid="text-hero-subtitle">
            Access world-class courses in programming, mathematics, science, and more. Learn at your own pace with expert instructors.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for courses..."
                className="pl-10 bg-background/95 backdrop-blur-sm border-0 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-hero-search"
              />
            </div>
            <Button type="submit" size="lg" className="bg-background text-foreground hover:bg-background/90 border border-background h-12 px-8" data-testid="button-hero-search">
              Search
            </Button>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 text-primary-foreground" data-testid="section-hero-stats">
            <div>
              <div className="text-3xl font-bold">2,500+</div>
              <div className="text-sm text-primary-foreground/80">Students Enrolled</div>
            </div>
            <div>
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm text-primary-foreground/80">Courses Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-primary-foreground/80">Expert Teachers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
