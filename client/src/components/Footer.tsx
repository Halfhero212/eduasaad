import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Youtube, Mail, Phone } from "lucide-react";

export default function Footer() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const footerLinks = {
    platform: [
      { label: t('footer.about'), href: '#' },
      { label: t('footer.how_it_works'), href: '#' },
      { label: t('footer.careers'), href: '#' },
      { label: t('footer.blog'), href: '#' },
    ],
    courses: [
      { label: t('footer.browse_courses'), href: '/courses' },
      { label: t('footer.become_teacher'), href: '#' },
      { label: t('footer.pricing'), href: '#' },
    ],
    support: [
      { label: t('footer.help_center'), href: '#' },
      { label: t('footer.contact_us'), href: '#' },
      { label: t('footer.privacy'), href: '#' },
      { label: t('footer.terms'), href: '#' },
    ],
  };

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              {language === 'ar' ? 'منصة ابراج التعليمية' : 'Abraj Educational Platform'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.tagline')}
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a 
                href="#" 
                className="w-9 h-9 rounded-md bg-muted hover-elevate active-elevate-2 flex items-center justify-center transition-colors"
                aria-label="Facebook"
                data-testid="link-social-facebook"
              >
                <Facebook className="w-4 h-4 text-muted-foreground" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-md bg-muted hover-elevate active-elevate-2 flex items-center justify-center transition-colors"
                aria-label="Twitter"
                data-testid="link-social-twitter"
              >
                <Twitter className="w-4 h-4 text-muted-foreground" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-md bg-muted hover-elevate active-elevate-2 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
                data-testid="link-social-linkedin"
              >
                <Linkedin className="w-4 h-4 text-muted-foreground" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-md bg-muted hover-elevate active-elevate-2 flex items-center justify-center transition-colors"
                aria-label="YouTube"
                data-testid="link-social-youtube"
              >
                <Youtube className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {t('footer.platform')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {t('footer.courses')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {t('footer.support')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <a 
                href="mailto:info@abraj.edu" 
                className="flex items-center gap-2 hover:text-foreground transition-colors"
                data-testid="link-footer-email"
              >
                <Mail className="w-4 h-4" />
                <span>info@abraj.edu</span>
              </a>
              <a 
                href="tel:+9467730145334" 
                className="flex items-center gap-2 hover:text-foreground transition-colors"
                data-testid="link-footer-phone"
              >
                <Phone className="w-4 h-4" />
                <span dir="ltr">+946 773 014 5334</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')} {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
