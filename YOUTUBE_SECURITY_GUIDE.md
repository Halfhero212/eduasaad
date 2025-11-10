# YouTube Video Security Guide for Teachers
# دليل أمان فيديوهات يوتيوب للمعلمين

## Overview / نظرة عامة

This guide helps teachers configure YouTube videos for maximum security while using the Abraj Educational Platform.

يساعد هذا الدليل المعلمين على تكوين فيديوهات اليوتيوب لتحقيق أقصى قدر من الأمان أثناء استخدام منصة ابراج التعليمية.

---

## Platform Security Features / ميزات الأمان في المنصة

### ✅ What the Platform Already Does / ما تقوم به المنصة بالفعل

1. **Enrollment Verification / التحقق من التسجيل**
   - Only enrolled students can access video URLs
   - Teachers and course owners have full access
   - Unenrolled users cannot see video links
   
   - فقط الطلاب المسجلين يمكنهم الوصول إلى روابط الفيديو
   - المعلمون وأصحاب الدورات لديهم وصول كامل
   - المستخدمون غير المسجلين لا يمكنهم رؤية روابط الفيديو

2. **Watermarking / العلامة المائية**
   - Student's name and email appear on every video
   - Discourages unauthorized sharing
   - Helps trace leaked videos back to source
   
   - يظهر اسم وبريد الطالب الإلكتروني على كل فيديو
   - يثبط المشاركة غير المصرح بها
   - يساعد في تتبع الفيديوهات المسربة إلى المصدر

3. **Enhanced Player Controls / عناصر تحكم محسنة للمشغل**
   - Privacy-enhanced YouTube embed (youtube-nocookie.com)
   - Disabled right-click and keyboard shortcuts
   - Hidden video information
   - Custom controls overlay
   
   - تضمين يوتيوب محسّن للخصوصية
   - تعطيل النقر بزر الماوس الأيمن واختصارات لوحة المفاتيح
   - معلومات الفيديو مخفية
   - طبقة تحكم مخصصة

4. **Access Logging / سجل الوصول**
   - Platform logs which students access which videos
   - Audit trail for security monitoring
   
   - تسجل المنصة أي الطلاب يصلون إلى أي الفيديوهات
   - مسار تدقيق لمراقبة الأمان

---

## YouTube Security Settings / إعدادات أمان اليوتيوب

### ⚠️ Important Limitation / قيد مهم

**YouTube URLs cannot be completely hidden.** When a student accesses a video through the platform, the YouTube video ID must be loaded in their browser. However, the following settings make unauthorized access much more difficult:

**لا يمكن إخفاء روابط اليوتيوب بشكل كامل.** عندما يصل طالب إلى فيديو من خلال المنصة، يجب تحميل معرّف فيديو اليوتيوب في متصفحه. ومع ذلك، فإن الإعدادات التالية تجعل الوصول غير المصرح به أكثر صعوبة:

### 🔒 Required YouTube Settings / الإعدادات المطلوبة في اليوتيوب

#### 1. Set Videos to "Unlisted" / اضبط الفيديوهات على "غير مدرجة"

**English:**
1. Go to YouTube Studio
2. Select your video
3. Click "Visibility"
4. Choose **"Unlisted"**
5. Save

**Benefits:**
- Video won't appear in search results
- Won't show on your channel page
- Only people with the link can find it

**العربية:**
1. انتقل إلى استوديو يوتيوب
2. حدد الفيديو الخاص بك
3. انقر على "الرؤية"
4. اختر **"غير مدرجة"**
5. احفظ

**الفوائد:**
- لن يظهر الفيديو في نتائج البحث
- لن يظهر على صفحة قناتك
- فقط الأشخاص الذين لديهم الرابط يمكنهم العثور عليه

---

#### 2. Enable Domain Restrictions (Recommended) / تفعيل قيود النطاق (موصى به)

**English:**
1. In YouTube Studio, go to video details
2. Click "Show more" 
3. Scroll to "Embedding"
4. Enable **"Enable embedding"**
5. Under advanced settings, add allowed domains:
   - `*.repl.co` (for Replit deployment)
   - Your custom domain if you have one

**Benefits:**
- Video can only be embedded on your specified domains
- Blocks embedding on other websites
- Additional layer of protection

**العربية:**
1. في استوديو يوتيوب، انتقل إلى تفاصيل الفيديو
2. انقر على "إظهار المزيد"
3. قم بالتمرير إلى "التضمين"
4. قم بتفعيل **"تمكين التضمين"**
5. في الإعدادات المتقدمة، أضف النطاقات المسموح بها:
   - `*.repl.co` (لنشر Replit)
   - نطاقك المخصص إذا كان لديك واحد

**الفوائد:**
- يمكن تضمين الفيديو فقط على النطاقات المحددة
- يمنع التضمين على مواقع ويب أخرى
- طبقة إضافية من الحماية

---

#### 3. Disable Comments and Likes / تعطيل التعليقات والإعجابات

**English:**
1. Video settings → Advanced
2. Disable comments
3. Hide like/dislike counts

**Benefits:**
- Reduces discoverability
- Prevents discussion that might leak video details

**العربية:**
1. إعدادات الفيديو ← متقدم
2. عطّل التعليقات
3. أخفِ عدد الإعجابات/عدم الإعجاب

**الفوائد:**
- يقلل من قابلية الاكتشاف
- يمنع المناقشة التي قد تسرّب تفاصيل الفيديو

---

#### 4. Disable "Show Video Suggestions" / تعطيل "إظهار اقتراحات الفيديو"

**English:**
1. Already handled by platform's embed parameters
2. Platform uses `rel=0` to minimize related video suggestions

**العربية:**
1. تتم معالجته بالفعل بواسطة معاملات التضمين في المنصة
2. تستخدم المنصة `rel=0` لتقليل اقتراحات الفيديو ذات الصلة

---

## Best Practices / أفضل الممارسات

### ✅ DO / افعل

- **Use descriptive but non-searchable titles** - Instead of "Physics Lesson 1", use a unique code like "PH-2024-L01-XYZ"
  
  **استخدم عناوين وصفية ولكن غير قابلة للبحث** - بدلاً من "درس الفيزياء 1"، استخدم رمزًا فريدًا مثل "PH-2024-L01-XYZ"

- **Create a dedicated channel** - Use a separate channel for course videos only
  
  **أنشئ قناة مخصصة** - استخدم قناة منفصلة لفيديوهات الدورة فقط

- **Monitor access logs** - Check platform logs regularly for unusual access patterns
  
  **راقب سجلات الوصول** - تحقق من سجلات المنصة بانتظام للبحث عن أنماط وصول غير عادية

- **Rotate videos if leaked** - If a video link is shared publicly, upload a new version and update the platform
  
  **قم بتدوير الفيديوهات في حالة التسريب** - إذا تمت مشاركة رابط فيديو علنًا، قم بتحميل نسخة جديدة وتحديث المنصة

### ❌ DON'T / لا تفعل

- **Don't use public videos** - Always use "Unlisted" or "Private"
  
  **لا تستخدم فيديوهات عامة** - استخدم دائمًا "غير مدرجة" أو "خاصة"

- **Don't share YouTube links directly** - Always direct students to the platform
  
  **لا تشارك روابط يوتيوب مباشرةً** - وجّه الطلاب دائمًا إلى المنصة

- **Don't use obvious keywords** - Avoid searchable course names in video titles
  
  **لا تستخدم كلمات مفتاحية واضحة** - تجنب أسماء الدورات القابلة للبحث في عناوين الفيديو

- **Don't reuse old course videos publicly** - Keep all course content unlisted
  
  **لا تعيد استخدام فيديوهات الدورات القديمة علنًا** - احتفظ بكل محتوى الدورة غير مدرج

---

## Understanding the Limitations / فهم القيود

### Why Can't We Completely Hide YouTube URLs? / لماذا لا يمكننا إخفاء روابط اليوتيوب بالكامل؟

**English:**
YouTube embeds work by loading the video in an iframe element in the browser. The browser **must** have the video ID to request the video from YouTube's servers. This means:

1. Anyone with browser developer tools can inspect the page and find the video ID
2. The YouTube URL is visible in network requests
3. No amount of code obfuscation can prevent this (it's a fundamental requirement of how browsers work)

**However**, the platform makes unauthorized access difficult through:
- Enrollment verification (unenrolled users never see video IDs)
- Watermarking (discourages sharing)
- Access logging (tracks who accesses what)
- Combined with YouTube's unlisted + domain restrictions

**العربية:**
تعمل عمليات تضمين يوتيوب عن طريق تحميل الفيديو في عنصر iframe في المتصفح. يجب على المتصفح **أن** يحصل على معرّف الفيديو لطلب الفيديو من خوادم يوتيوب. هذا يعني:

1. يمكن لأي شخص لديه أدوات مطور المتصفح فحص الصفحة والعثور على معرّف الفيديو
2. يكون رابط يوتيوب مرئيًا في طلبات الشبكة
3. لا يمكن لأي قدر من تشويش الكود منع ذلك (إنه متطلب أساسي لكيفية عمل المتصفحات)

**ومع ذلك**، تجعل المنصة الوصول غير المصرح به صعبًا من خلال:
- التحقق من التسجيل (المستخدمون غير المسجلين لا يرون أبدًا معرّفات الفيديو)
- العلامة المائية (تثبط المشاركة)
- سجل الوصول (يتتبع من يصل إلى ماذا)
- مجتمعة مع إعدادات يوتيوب غير المدرجة + قيود النطاق

---

## If a Video is Leaked / إذا تم تسريب فيديو

### Steps to Take / الخطوات التي يجب اتخاذها

**English:**
1. **Identify the source** - Check access logs to see which student's watermark appears
2. **Contact the student** - Discuss the violation with them
3. **Upload new video** - Create a new version with different video ID
4. **Update platform** - Replace the old YouTube URL with the new one
5. **Delete old video** - Remove the leaked video from YouTube
6. **Monitor** - Watch for repeat violations

**العربية:**
1. **حدد المصدر** - تحقق من سجلات الوصول لمعرفة أي علامة مائية للطالب تظهر
2. **اتصل بالطالب** - ناقش الانتهاك معهم
3. **قم بتحميل فيديو جديد** - أنشئ نسخة جديدة بمعرّف فيديو مختلف
4. **قم بتحديث المنصة** - استبدل رابط يوتيوب القديم بالجديد
5. **احذف الفيديو القديم** - أزل الفيديو المسرّب من يوتيوب
6. **راقب** - راقب الانتهاكات المتكررة

---

## Additional Security Considerations / اعتبارات أمان إضافية

### Copyright Strikes / ضربات حقوق الطبع والنشر

If students re-upload your videos:
- File copyright claims with YouTube
- Platform watermarks help prove ownership

إذا أعاد الطلاب تحميل فيديوهاتك:
- قدم مطالبات حقوق الطبع والنشر إلى يوتيوب
- تساعد العلامات المائية للمنصة في إثبات الملكية

### Alternative: YouTube Memberships / البديل: عضويات يوتيوب

For maximum security, consider YouTube's paid membership features:
- Members-only videos
- Built-in payment processing
- More control over access

للحصول على أقصى قدر من الأمان، ضع في اعتبارك ميزات العضوية المدفوعة في يوتيوب:
- فيديوهات للأعضاء فقط
- معالجة الدفع المدمجة
- مزيد من التحكم في الوصول

---

## Support / الدعم

If you have questions about video security:
- Contact platform administrators
- Review platform documentation
- Check YouTube Help Center

إذا كانت لديك أسئلة حول أمان الفيديو:
- اتصل بمسؤولي المنصة
- راجع وثائق المنصة
- تحقق من مركز مساعدة يوتيوب

---

**Remember:** No system is 100% secure. The goal is to make unauthorized sharing difficult enough that it's not worth the effort for most students.

**تذكر:** لا يوجد نظام آمن بنسبة 100%. الهدف هو جعل المشاركة غير المصرح بها صعبة بما يكفي بحيث لا تستحق الجهد بالنسبة لمعظم الطلاب.
