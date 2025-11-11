// Centralized Arabic notification messages for the platform

export const notificationMessages = {
  enrollment: {
    newStudentFree: {
      title: "طالب جديد مسجل",
      message: (studentName: string, courseTitle: string) => 
        `${studentName} سجل في دورتك "${courseTitle}"`,
    },
    newEnrollmentRequest: {
      title: "طلب تسجيل جديد",
      message: (studentName: string, courseTitle: string) =>
        `${studentName} طلب التسجيل في "${courseTitle}". يرجى التحقق من واتساب لتأكيد الدفع.`,
    },
    confirmed: {
      title: "تم تأكيد التسجيل",
      message: (courseTitle: string) =>
        `تم تأكيد تسجيلك في "${courseTitle}". يمكنك الآن الوصول إلى جميع الدروس.`,
    },
    confirmedSimple: {
      title: "تم تأكيد التسجيل",
      message: "تم تأكيد تسجيلك في الدورة. يمكنك الآن الوصول إلى جميع الدروس.",
    },
  },
  quiz: {
    newAvailable: {
      title: "اختبار جديد متاح",
      message: (quizTitle: string, courseTitle: string) =>
        `تم إضافة اختبار جديد "${quizTitle}" إلى ${courseTitle}`,
    },
    newSubmission: {
      title: "إرسال اختبار جديد",
      message: (studentName: string, quizTitle: string) =>
        `${studentName} أرسل "${quizTitle}"`,
    },
    graded: {
      title: "تم تقييم الاختبار",
      message: (quizTitle: string, score: number) =>
        `تم تقييم اختبارك "${quizTitle}". الدرجة: ${score}%`,
    },
  },
  question: {
    new: {
      title: "سؤال جديد",
      message: (studentName: string, lessonTitle: string) =>
        `${studentName} طرح سؤالاً على "${lessonTitle}"`,
    },
    teacherReply: {
      title: "رد المعلم",
      message: (teacherName: string, lessonTitle: string) =>
        `${teacherName} رد على سؤالك في "${lessonTitle}"`,
    },
  },
  announcement: {
    new: {
      title: (announcementTitle: string) => `إعلان جديد: ${announcementTitle}`,
      message: (courseTitle: string) => `لديك إعلان جديد في دورة ${courseTitle}`,
    },
  },
} as const;
