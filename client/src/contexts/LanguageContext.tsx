import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Common
    "app.name": "منصة التعلم",
    "app.tagline": "حوّل مستقبلك بدورات يقدمها خبراء",
    "app.description": "تعلم من خبراء الصناعة وحقق أهدافك مع منصتنا التعليمية الشاملة",
    
    // Navigation
    "nav.browse": "تصفح الدورات",
    "nav.my_learning": "تعلمي",
    "nav.dashboard": "لوحة التحكم",
    "nav.sign_in": "تسجيل الدخول",
    "nav.get_started": "ابدأ الآن",
    "nav.logout": "تسجيل الخروج",
    
    // Home Page
    "home.hero_title": "حوّل مستقبلك بدورات يقدمها خبراء",
    "home.hero_subtitle": "تعلم من خبراء الصناعة وحقق أهدافك مع منصتنا التعليمية الشاملة",
    "home.get_started": "ابدأ مجاناً",
    "home.browse_courses": "تصفح الدورات",
    "home.stats.courses": "دورة",
    "home.stats.students": "طالب",
    "home.stats.teachers": "معلم خبير",
    "home.stats.rating": "تقييم متوسط",
    "home.featured_courses": "الدورات المميزة",
    "home.view_all": "عرض الكل",
    
    // Courses
    "courses.title": "استكشف دوراتنا",
    "courses.subtitle": "اكتشف دورات في البرمجة، الرياضيات، العلوم، والمزيد",
    "courses.filter_all": "الكل",
    "courses.free": "مجاني",
    "courses.paid": "مدفوع",
    "courses.enroll": "التسجيل",
    "courses.buy": "شراء الدورة",
    "courses.no_courses": "لم يتم العثور على دورات",
    "courses.what_you_learn": "ما ستتعلمه",
    "courses.lessons": "درس",
    "courses.instructor": "المدرس",
    
    // Auth
    "auth.login": "تسجيل الدخول",
    "auth.register": "إنشاء حساب",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.full_name": "الاسم الكامل",
    "auth.sign_in": "تسجيل الدخول",
    "auth.create_account": "إنشاء حساب",
    "auth.no_account": "ليس لديك حساب؟",
    "auth.have_account": "لديك حساب؟",
    
    // Dashboard - Superadmin
    "dashboard.superadmin.title": "لوحة تحكم المسؤول",
    "dashboard.superadmin.subtitle": "إدارة مستخدمي المنصة ومراقبة الإحصائيات",
    "dashboard.superadmin.total_teachers": "إجمالي المعلمين",
    "dashboard.superadmin.total_students": "إجمالي الطلاب",
    "dashboard.superadmin.total_courses": "إجمالي الدورات",
    "dashboard.superadmin.total_enrollments": "إجمالي التسجيلات",
    "dashboard.superadmin.teachers": "المعلمون",
    "dashboard.superadmin.manage_teachers": "إدارة حسابات المعلمين",
    "dashboard.superadmin.create_teacher": "إنشاء معلم",
    "dashboard.superadmin.students": "الطلاب",
    "dashboard.superadmin.manage_students": "إدارة حسابات الطلاب",
    "dashboard.superadmin.name": "الاسم",
    "dashboard.superadmin.email": "البريد الإلكتروني",
    "dashboard.superadmin.status": "الحالة",
    "dashboard.superadmin.active": "نشط",
    "dashboard.superadmin.no_teachers": "لم يتم العثور على معلمين",
    "dashboard.superadmin.no_students": "لم يتم العثور على طلاب",
    
    // Dashboard - Teacher
    "dashboard.teacher.title": "لوحة تحكم المعلم",
    "dashboard.teacher.welcome": "مرحباً بعودتك",
    "dashboard.teacher.my_courses": "دوراتي",
    "dashboard.teacher.students": "الطلاب",
    "dashboard.teacher.total_enrollments": "إجمالي التسجيلات",
    "dashboard.teacher.create_course": "إنشاء دورة",
    "dashboard.teacher.manage_courses": "إدارة دوراتك",
    "dashboard.teacher.no_courses": "لم تنشئ أي دورات بعد",
    "dashboard.teacher.get_started": "ابدأ بإنشاء دورتك الأولى",
    
    // Dashboard - Student
    "dashboard.student.title": "لوحة تحكم الطالب",
    "dashboard.student.welcome": "مرحباً بعودتك",
    "dashboard.student.continue": "واصل رحلتك التعليمية",
    "dashboard.student.enrolled_courses": "الدورات المسجلة",
    "dashboard.student.completed": "مكتملة",
    "dashboard.student.avg_progress": "متوسط التقدم",
    "dashboard.student.my_courses": "دوراتي",
    "dashboard.student.continue_learning": "واصل التعلم",
    "dashboard.student.progress": "التقدم",
    "dashboard.student.resume": "استئناف",
    "dashboard.student.no_courses": "لم تسجل في أي دورات بعد",
    "dashboard.student.explore": "استكشف دوراتنا وابدأ التعلم اليوم",
    
    // Create Teacher Dialog
    "dialog.create_teacher.title": "إنشاء حساب معلم",
    "dialog.create_teacher.description": "إنشاء حساب معلم جديد. سيتم إنشاء كلمة مرور عشوائية.",
    "dialog.create_teacher.full_name": "الاسم الكامل",
    "dialog.create_teacher.email": "البريد الإلكتروني",
    "dialog.create_teacher.cancel": "إلغاء",
    "dialog.create_teacher.create": "إنشاء",
    "dialog.create_teacher.creating": "جاري الإنشاء...",
    
    // Common Actions
    "action.view": "عرض",
    "action.edit": "تعديل",
    "action.delete": "حذف",
    "action.save": "حفظ",
    "action.cancel": "إلغاء",
    "action.submit": "إرسال",
    "action.back": "رجوع",
    "action.next": "التالي",
    "action.close": "إغلاق",
    
    // Categories
    "category.programming": "البرمجة",
    "category.mathematics": "الرياضيات",
    "category.science": "العلوم",
    "category.languages": "اللغات",
    "category.business": "الأعمال",
    "category.design": "التصميم",
    
    // Status
    "status.pending": "قيد الانتظار",
    "status.confirmed": "مؤكد",
    "status.active": "نشط",
    "status.inactive": "غير نشط",
  },
  en: {
    // Common
    "app.name": "EduPlatform",
    "app.tagline": "Transform Your Future with Expert-Led Courses",
    "app.description": "Learn from industry experts and achieve your goals with our comprehensive learning platform",
    
    // Navigation
    "nav.browse": "Browse Courses",
    "nav.my_learning": "My Learning",
    "nav.dashboard": "Dashboard",
    "nav.sign_in": "Sign in",
    "nav.get_started": "Get started",
    "nav.logout": "Log out",
    
    // Home Page
    "home.hero_title": "Transform Your Future with Expert-Led Courses",
    "home.hero_subtitle": "Learn from industry experts and achieve your goals with our comprehensive learning platform",
    "home.get_started": "Get Started Free",
    "home.browse_courses": "Browse Courses",
    "home.stats.courses": "Courses",
    "home.stats.students": "Students",
    "home.stats.teachers": "Expert Teachers",
    "home.stats.rating": "Average Rating",
    "home.featured_courses": "Featured Courses",
    "home.view_all": "View All",
    
    // Courses
    "courses.title": "Explore Our Courses",
    "courses.subtitle": "Discover courses in programming, mathematics, science, and more",
    "courses.filter_all": "All",
    "courses.free": "Free",
    "courses.paid": "Paid",
    "courses.enroll": "Enroll",
    "courses.buy": "Buy Course",
    "courses.no_courses": "No courses found",
    "courses.what_you_learn": "What you'll learn",
    "courses.lessons": "Lessons",
    "courses.instructor": "Instructor",
    
    // Auth
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.full_name": "Full Name",
    "auth.sign_in": "Sign in",
    "auth.create_account": "Create Account",
    "auth.no_account": "Don't have an account?",
    "auth.have_account": "Already have an account?",
    
    // Dashboard - Superadmin
    "dashboard.superadmin.title": "Superadmin Dashboard",
    "dashboard.superadmin.subtitle": "Manage platform users and monitor statistics",
    "dashboard.superadmin.total_teachers": "Total Teachers",
    "dashboard.superadmin.total_students": "Total Students",
    "dashboard.superadmin.total_courses": "Total Courses",
    "dashboard.superadmin.total_enrollments": "Total Enrollments",
    "dashboard.superadmin.teachers": "Teachers",
    "dashboard.superadmin.manage_teachers": "Manage teacher accounts",
    "dashboard.superadmin.create_teacher": "Create Teacher",
    "dashboard.superadmin.students": "Students",
    "dashboard.superadmin.manage_students": "Manage student accounts",
    "dashboard.superadmin.name": "Name",
    "dashboard.superadmin.email": "Email",
    "dashboard.superadmin.status": "Status",
    "dashboard.superadmin.active": "Active",
    "dashboard.superadmin.no_teachers": "No teachers found",
    "dashboard.superadmin.no_students": "No students found",
    
    // Dashboard - Teacher
    "dashboard.teacher.title": "Teacher Dashboard",
    "dashboard.teacher.welcome": "Welcome back",
    "dashboard.teacher.my_courses": "My Courses",
    "dashboard.teacher.students": "Students",
    "dashboard.teacher.total_enrollments": "Total Enrollments",
    "dashboard.teacher.create_course": "Create Course",
    "dashboard.teacher.manage_courses": "Manage your courses",
    "dashboard.teacher.no_courses": "You haven't created any courses yet",
    "dashboard.teacher.get_started": "Get started by creating your first course",
    
    // Dashboard - Student
    "dashboard.student.title": "Student Dashboard",
    "dashboard.student.welcome": "Welcome back",
    "dashboard.student.continue": "Continue your learning journey",
    "dashboard.student.enrolled_courses": "Enrolled Courses",
    "dashboard.student.completed": "Completed",
    "dashboard.student.avg_progress": "Average Progress",
    "dashboard.student.my_courses": "My Courses",
    "dashboard.student.continue_learning": "Continue Learning",
    "dashboard.student.progress": "Progress",
    "dashboard.student.resume": "Resume",
    "dashboard.student.no_courses": "You haven't enrolled in any courses yet",
    "dashboard.student.explore": "Explore our courses and start learning today",
    
    // Create Teacher Dialog
    "dialog.create_teacher.title": "Create Teacher Account",
    "dialog.create_teacher.description": "Create a new teacher account. A random password will be generated.",
    "dialog.create_teacher.full_name": "Full Name",
    "dialog.create_teacher.email": "Email",
    "dialog.create_teacher.cancel": "Cancel",
    "dialog.create_teacher.create": "Create",
    "dialog.create_teacher.creating": "Creating...",
    
    // Common Actions
    "action.view": "View",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.submit": "Submit",
    "action.back": "Back",
    "action.next": "Next",
    "action.close": "Close",
    
    // Categories
    "category.programming": "Programming",
    "category.mathematics": "Mathematics",
    "category.science": "Science",
    "category.languages": "Languages",
    "category.business": "Business",
    "category.design": "Design",
    
    // Status
    "status.pending": "Pending",
    "status.confirmed": "Confirmed",
    "status.active": "Active",
    "status.inactive": "Inactive",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "ar"; // Default to Arabic
  });

  const isRTL = language === "ar";

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    
    // Update page title
    document.title = language === "ar" 
      ? "منصة التعلم - أتقن مهارات جديدة" 
      : "Learning Platform - Master New Skills";
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
