import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Award } from "lucide-react";

export default function AboutUs() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const features = [
    {
      icon: GraduationCap,
      titleKey: 'about.feature_quality_title',
      descKey: 'about.feature_quality_desc',
    },
    {
      icon: Users,
      titleKey: 'about.feature_teachers_title',
      descKey: 'about.feature_teachers_desc',
    },
    {
      icon: BookOpen,
      titleKey: 'about.feature_courses_title',
      descKey: 'about.feature_courses_desc',
    },
    {
      icon: Award,
      titleKey: 'about.feature_progress_title',
      descKey: 'about.feature_progress_desc',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="heading-about-title">
            {t('about.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-about-subtitle">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="heading-mission">
              {t('about.mission_title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg" data-testid="text-mission">
              {t('about.mission_desc')}
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8" data-testid="heading-features">
            {t('about.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(feature.descKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Vision Section */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="heading-vision">
              {t('about.vision_title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg" data-testid="text-vision">
              {t('about.vision_desc')}
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
