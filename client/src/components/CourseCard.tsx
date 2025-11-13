import { Clock, MessageSquare, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatIQD } from "@/lib/utils";

interface CourseCardProps {
  id: string | number;
  title: string;
  description: string;
  teacher: {
    name: string;
    avatar?: string;
  };
  category: string;
  price?: number;
  isFree?: boolean;
  thumbnail: string;
  lessonCount?: number;
  duration?: string;
  enrollmentCount?: number;
  progress?: number;
  enrolled?: boolean;
  onClick?: () => void;
}

export function CourseCard({
  id,
  title,
  description,
  teacher,
  category,
  price,
  isFree = false,
  thumbnail,
  lessonCount,
  duration,
  enrollmentCount,
  progress,
  enrolled = false,
  onClick,
}: CourseCardProps) {
  const { t } = useLanguage();
  const priceTag = price ? formatIQD(price, t("courses.currency")) : "";

  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all group"
      onClick={onClick}
      data-testid={`card-course-${id}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Category Badge */}
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm" data-testid={`badge-category-${id}`}>
          {category}
        </Badge>

        {/* Price Badge */}
        {isFree ? (
          <Badge className="absolute top-3 right-3 bg-chart-3 text-primary-foreground" data-testid={`badge-price-${id}`}>
            {t("courses.free")}
          </Badge>
        ) : price ? (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground" data-testid={`badge-price-${id}`}>
            {priceTag}
          </Badge>
        ) : null}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-title-${id}`}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-description-${id}`}>
          {description}
        </p>

        {/* Teacher */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground text-sm font-medium">
            {teacher.avatar || teacher.name[0]}
          </div>
          <span className="text-sm text-muted-foreground" data-testid={`text-teacher-${id}`}>
            {teacher.name}
          </span>
        </div>

        {/* Progress Bar (for enrolled students) */}
        {enrolled && progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium" data-testid={`text-progress-${id}`}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {lessonCount && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span data-testid={`text-lessons-${id}`}>{lessonCount} lessons</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span data-testid={`text-duration-${id}`}>{duration}</span>
            </div>
          )}
          {enrollmentCount && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span data-testid={`text-enrollments-${id}`}>{enrollmentCount}</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        {enrolled ? (
          <Button className="w-full" variant="default" data-testid={`button-continue-${id}`}>
            Continue Learning
          </Button>
        ) : (
          <Button className="w-full" variant="outline" data-testid={`button-view-${id}`}>
            View Course
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
