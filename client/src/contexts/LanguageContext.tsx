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
    "courses.not_found": "الدورة غير موجودة",
    "courses.back_to_home": "العودة للصفحة الرئيسية",
    "courses.created_by": "أنشئت بواسطة",
    "courses.one_time_payment": "دفعة واحدة",
    "courses.continue_learning": "واصل التعلم",
    "courses.enrolling": "جاري التسجيل...",
    "courses.enroll_free": "سجّل مجاناً",
    "courses.buy_whatsapp": "اشترِ عبر واتساب",
    "courses.sign_in_to_enroll": "الرجاء تسجيل الدخول للتسجيل",
    "courses.course_content": "محتوى الدورة",
    "courses.lesson_label": "الدرس",
    "courses.min": "دقيقة",
    "courses.watch": "مشاهدة",
    "courses.no_lessons": "لا توجد دروس متاحة بعد",
    "courses.your_instructor": "معلمك",
    "courses.unknown": "غير معروف",
    "courses.whatsapp_message": "مرحباً! أود التسجيل في \"{title}\" (${price})",
    
    // Lesson
    "lesson.not_found": "الدرس غير موجود",
    "lesson.back_to_course": "العودة للدورة",
    "lesson.no_video": "لا يوجد فيديو متاح",
    "lesson.previous": "السابق",
    "lesson.mark_complete": "وضع علامة كمكتمل",
    
    // Comments/Q&A
    "comment.ask_question": "اطرح سؤالاً",
    "comment.ask_placeholder": "اسأل معلمك سؤالاً عن هذا الدرس...",
    "comment.post_question": "انشر السؤال",
    "comment.posting": "جاري النشر...",
    "comment.no_questions": "لا توجد أسئلة بعد. كن أول من يسأل!",
    "comment.teacher_badge": "معلم",
    
    // Toast Messages
    "toast.enrollment_success": "نجح التسجيل",
    "toast.enrollment_success_desc": "يمكنك الآن الوصول إلى محتوى الدورة",
    "toast.enrollment_failed": "فشل التسجيل",
    "toast.lesson_completed": "اكتمل الدرس!",
    "toast.lesson_completed_desc": "عمل رائع! واصل التعلم.",
    "toast.question_posted": "تم نشر السؤال",
    "toast.question_posted_desc": "سيرد معلمك قريباً",
    "toast.question_failed": "فشل نشر السؤال",
    "toast.error_generic": "حدث خطأ ما",
    "toast.course_created": "تم إنشاء الدورة بنجاح",
    "toast.course_created_desc": "يمكنك الآن إضافة دروس لدورتك",
    "toast.course_create_failed": "فشل إنشاء الدورة",
    "toast.validation_error": "خطأ في التحقق",
    "toast.fill_required_fields": "يرجى ملء جميع الحقول المطلوبة",
    "toast.enter_valid_price": "يرجى إدخال سعر صالح أو تحديد الدورة كمجانية",
    
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
    "dialog.create_teacher.success": "تم إنشاء المعلم بنجاح!",
    "dialog.create_teacher.password_label": "كلمة المرور المولدة",
    "dialog.create_teacher.password_note": "يرجى حفظ كلمة المرور هذه ومشاركتها مع المعلم. لن تظهر مرة أخرى.",
    "dialog.create_teacher.copy_password": "نسخ كلمة المرور",
    "dialog.create_teacher.password_copied": "تم نسخ كلمة المرور!",
    "dialog.create_teacher.password_copied_desc": "تم نسخ كلمة المرور إلى الحافظة",
    "dialog.create_teacher.failed": "فشل إنشاء المعلم",
    "dialog.create_teacher.validation_error": "خطأ في التحقق",
    "dialog.create_teacher.fill_all_fields": "يرجى ملء جميع الحقول",
    
    // Delete Confirmation
    "dialog.delete.title": "تأكيد الحذف",
    "dialog.delete.teacher_message": "هل أنت متأكد من حذف هذا المعلم؟ هذا الإجراء لا يمكن التراجع عنه.",
    "dialog.delete.student_message": "هل أنت متأكد من حذف هذا الطالب؟ هذا الإجراء لا يمكن التراجع عنه.",
    "dialog.delete.confirm": "نعم، احذف",
    "dialog.delete.cancel": "إلغاء",
    "dialog.delete.deleting": "جاري الحذف...",
    "dialog.delete.teacher_success": "تم حذف المعلم بنجاح",
    "dialog.delete.teacher_success_desc": "تم حذف حساب المعلم من المنصة",
    "dialog.delete.student_success": "تم حذف الطالب بنجاح",
    "dialog.delete.student_success_desc": "تم حذف حساب الطالب من المنصة",
    "dialog.delete.failed": "فشل الحذف",
    
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
    
    // Form Labels
    "label.course_title": "عنوان الدورة",
    "label.category": "الفئة",
    "label.description": "الوصف",
    "label.price": "السعر",
    
    // Placeholders
    "placeholder.course_title": "مقدمة في تطوير الويب",
    "placeholder.course_description": "دورة شاملة تغطي...",
    "placeholder.what_you_learn": "بناء تطبيقات الويب\nفهم JavaScript\nالعمل مع واجهات برمجة التطبيقات",
    "placeholder.price": "49.99",
    
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
    "courses.not_found": "Course not found",
    "courses.back_to_home": "Back to Home",
    "courses.created_by": "Created by",
    "courses.one_time_payment": "One-time payment",
    "courses.continue_learning": "Continue Learning",
    "courses.enrolling": "Enrolling...",
    "courses.enroll_free": "Enroll for Free",
    "courses.buy_whatsapp": "Buy via WhatsApp",
    "courses.sign_in_to_enroll": "Please sign in to enroll",
    "courses.course_content": "Course Content",
    "courses.lesson_label": "Lesson",
    "courses.min": "min",
    "courses.watch": "Watch",
    "courses.no_lessons": "No lessons available yet",
    "courses.your_instructor": "Your Instructor",
    "courses.unknown": "Unknown",
    "courses.whatsapp_message": "Hi! I would like to enroll in \"{title}\" (${price})",
    
    // Lesson
    "lesson.not_found": "Lesson not found",
    "lesson.back_to_course": "Back to Course",
    "lesson.no_video": "No video available",
    "lesson.previous": "Previous",
    "lesson.mark_complete": "Mark as Complete",
    
    // Comments/Q&A
    "comment.ask_question": "Ask a Question",
    "comment.ask_placeholder": "Ask your teacher a question about this lesson...",
    "comment.post_question": "Post Question",
    "comment.posting": "Posting...",
    "comment.no_questions": "No questions yet. Be the first to ask!",
    "comment.teacher_badge": "Teacher",
    
    // Toast Messages
    "toast.enrollment_success": "Enrollment successful",
    "toast.enrollment_success_desc": "You can now access the course content",
    "toast.enrollment_failed": "Enrollment failed",
    "toast.lesson_completed": "Lesson completed!",
    "toast.lesson_completed_desc": "Great job! Keep learning.",
    "toast.question_posted": "Question posted",
    "toast.question_posted_desc": "Your teacher will respond soon",
    "toast.question_failed": "Failed to post question",
    "toast.error_generic": "Something went wrong",
    "toast.course_created": "Course created successfully",
    "toast.course_created_desc": "You can now add lessons to your course",
    "toast.course_create_failed": "Failed to create course",
    "toast.validation_error": "Validation error",
    "toast.fill_required_fields": "Please fill in all required fields",
    "toast.enter_valid_price": "Please enter a valid price or mark the course as free",
    
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
    "dialog.create_teacher.success": "Teacher created successfully!",
    "dialog.create_teacher.password_label": "Generated Password",
    "dialog.create_teacher.password_note": "Please save this password and share it with the teacher. It will not be shown again.",
    "dialog.create_teacher.copy_password": "Copy Password",
    "dialog.create_teacher.password_copied": "Password copied!",
    "dialog.create_teacher.password_copied_desc": "Password copied to clipboard",
    "dialog.create_teacher.failed": "Failed to create teacher",
    "dialog.create_teacher.validation_error": "Validation error",
    "dialog.create_teacher.fill_all_fields": "Please fill in all fields",
    
    // Delete Confirmation
    "dialog.delete.title": "Confirm Deletion",
    "dialog.delete.teacher_message": "Are you sure you want to delete this teacher? This action cannot be undone.",
    "dialog.delete.student_message": "Are you sure you want to delete this student? This action cannot be undone.",
    "dialog.delete.confirm": "Yes, Delete",
    "dialog.delete.cancel": "Cancel",
    "dialog.delete.deleting": "Deleting...",
    "dialog.delete.teacher_success": "Teacher deleted successfully",
    "dialog.delete.teacher_success_desc": "The teacher account has been removed from the platform",
    "dialog.delete.student_success": "Student deleted successfully",
    "dialog.delete.student_success_desc": "The student account has been removed from the platform",
    "dialog.delete.failed": "Delete failed",
    
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
    
    // Form Labels
    "label.course_title": "Course Title",
    "label.category": "Category",
    "label.description": "Description",
    "label.price": "Price",
    
    // Placeholders
    "placeholder.course_title": "Introduction to Web Development",
    "placeholder.course_description": "A comprehensive course that covers...",
    "placeholder.what_you_learn": "Build web applications\nUnderstand JavaScript\nWork with APIs",
    "placeholder.price": "49.99",
    
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
