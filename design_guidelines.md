# EduPlatform Design Guidelines

## Design Approach

**Selected Approach**: Hybrid - Material Design foundation with Coursera/edX-inspired educational interfaces

**Rationale**: Educational platforms demand exceptional clarity for cognitive focus while maintaining visual appeal to sustain engagement. Material Design provides robust patterns for data-dense dashboards, while leading EdTech platforms demonstrate effective course merchandising and learning experiences.

**Key References**:
- Coursera: Video player interface, progress tracking, clean hierarchy
- edX: Professional course presentation, trust indicators
- Linear: Typography excellence, spacing rhythm
- Material Design: Dashboard layouts, data visualization

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 210 80% 48% (Deep trustworthy blue for CTAs, navigation)
- Secondary: 160 60% 45% (Calming teal for progress, achievements)
- Success: 145 65% 42% (Professional green for completions)
- Warning: 35 90% 55% (Warm amber for attention)
- Error: 355 75% 50% (Controlled red for errors)
- Background: 210 20% 98% (Soft off-white, reduces eye strain)
- Surface: 210 15% 95% (Light blue-gray for cards, elevating content)
- Text Primary: 215 25% 20% (Deep blue-black for readability)
- Text Secondary: 215 15% 50% (Medium gray for supporting text)
- Accent Highlight: 175 70% 40% (Vibrant green for interactive elements)

**Gradient Applications**:
- Hero sections: 210 80% 48% to 175 70% 40% (blue to green, 60° angle)
- Course category badges: Subtle 10% opacity color wash
- Progress indicators: Animated gradient fills for completion states

### B. Typography

**Font Families** (Google Fonts CDN):
- Primary: 'Inter' (400, 500, 600, 700) - UI, body text, data tables
- Headings: 'Plus Jakarta Sans' (600, 700, 800) - Page titles, hero headlines
- Monospace: 'Fira Code' (400, 500) - Code blocks in programming courses

**Type Scale**:
- Hero: text-5xl md:text-6xl lg:text-7xl
- Page Title: text-3xl md:text-4xl
- Section Header: text-2xl md:text-3xl
- Card Title/Lesson: text-lg md:text-xl
- Body: text-base
- Meta/Caption: text-sm
- Labels: text-xs

**Line Heights**: Generous spacing for readability - leading-relaxed for body text, leading-tight for headlines

### C. Layout System

**Spacing Primitives**: Use 4, 6, 8 for tight spacing | 12, 16, 20 for section padding | 24, 32 for major section breaks

**Container Strategy**:
- Course catalog/grids: max-w-7xl
- Dashboard content: max-w-6xl
- Reading content/forms: max-w-3xl
- Video player: Full-width with max-w-7xl inner container

**Grid Patterns**:
- Course cards: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
- Dashboard stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
- Lesson sidebar: Fixed 320px width on desktop, full-width drawer on mobile

### D. Component Library

**Navigation Bar**:
- Fixed header with backdrop blur, subtle border-bottom
- Left: Logo + main nav (Browse Courses, My Learning, Dashboard)
- Right: Search icon, notification bell with badge, user dropdown with avatar
- Mobile: Hamburger with full-screen overlay menu
- Role indicator badge next to avatar (Superadmin/Teacher/Student)

**Course Cards**:
- 16:9 thumbnail with category badge overlay (top-left, small pill)
- Gradient scrim bottom 40% for text legibility
- Course title (bold, 2-line clamp), instructor name with micro avatar
- Rating stars + enrollment count row
- Price/FREE badge (prominent, top-right corner)
- Enrolled students see progress bar at bottom edge
- Hover: Subtle lift (translateY -2px), enhanced shadow

**Hero Section** (Homepage):
- Full-width background image: Modern learning environment (students with laptops, bright collaborative space)
- Gradient overlay: 210 80% 48% to 175 70% 40% with 85% opacity for text contrast
- Centered content: Headline "Transform Your Future with Expert-Led Courses", subheadline, search bar (large, white background), trust metrics row
- Search bar: Prominent with icon, placeholder "What do you want to learn?", rounded-lg
- Buttons on hero images: Blurred background (backdrop-blur-md bg-white/20)

**Dashboard Components**:
- Stat Cards: Large number (text-4xl), icon in colored circle, label, trend arrow with percentage
- Data Tables: Alternating row background, sticky headers, sortable columns, row actions (icon buttons)
- Progress Rings: SVG circular progress with percentage inside, color-coded by completion
- Activity Timeline: Left-aligned vertical line with timestamps, user avatars, action descriptions
- Analytics Charts: Clean line/bar charts using Chart.js, minimal grid lines, branded colors

**Video Player Layout**:
- Main area (70% width lg): Responsive 16:9 YouTube embed, lesson title above, description accordion below, Q&A thread section
- Sidebar (30% width lg, drawer on mobile): Scrollable lesson list with check icons for completed, lock icons for locked, active lesson highlighted
- Below video: Mark Complete button (success color), Next Lesson button (primary)
- Controls: Clean overlay on hover, progress bar always visible

**Quiz Interface**:
- Student view: Question display with large text, image upload drag-drop zone (dashed border, teal accent on hover), submit button
- Teacher view: Submissions grid (3 columns), each showing student name, thumbnail preview, timestamp, status badge
- Solution modal: Full-size image preview, feedback textarea, approve/reject action buttons

**Comment Threads**:
- Student question: Avatar, name, timestamp, question text, reply count
- Teacher reply: Indented, highlighted background (Surface color), "Teacher" badge, answer text
- New question form: Textarea with floating label, character count, submit button

**Forms & Inputs**:
- Floating labels for text inputs (transform on focus)
- Validation: Green checkmark icon for valid, red text below for errors
- Multi-step course creation: Horizontal stepper with numbered circles, progress line
- File uploads: Large drag-drop area with cloud upload icon, file type restrictions shown

**Buttons**:
- Primary: bg-Primary text-white, hover:brightness-110
- Secondary: border-Primary text-Primary, hover:bg-Primary/5
- Success: bg-Success text-white (Complete, Approve)
- Danger: bg-Error text-white (Delete, Reject)
- Ghost: transparent, hover:bg-Surface
- All sizes: py-2 px-4 (sm), py-3 px-6 (base), py-4 px-8 (lg)

**Modals & Notifications**:
- Modal overlay: bg-black/50 backdrop-blur-sm
- Modal content: Rounded corners, shadow-2xl, max-w-2xl
- Toast notifications: Top-right, slide-in animation, auto-dismiss 4s
- Notification dropdown: Max 5 visible, scroll for more, grouped by type with dividers

### E. Page-Specific Layouts

**Homepage**:
- Hero with background image and search (as described above)
- Trust bar: Stats row (X,000+ Students • Y Courses • Z Expert Teachers)
- Category pills: Horizontal scroll on mobile, wrapped grid on desktop
- Featured courses grid: 4 columns on xl, "View All Courses" link
- How It Works: 3-column feature cards with numbered icons

**Role Dashboards**:
- **Superadmin**: 4-column stat cards, user management table with filters, platform revenue chart, recent activity feed (right sidebar on xl)
- **Teacher**: 3-column stats (Courses, Students, Pending Reviews), "My Courses" table with edit/view actions, "Recent Questions" feed, "Create New Course" prominent CTA
- **Student**: 3-column stats (Enrolled, Completed, Quiz Average), "Continue Learning" carousel, progress breakdown per course (list with progress rings), "Browse More Courses" CTA

**Course Detail**:
- Course hero: Left 60% large thumbnail, right 40% title, instructor info with avatar, rating, student count, price, WhatsApp CTA (green #25D366)
- Tabs navigation: Overview, Curriculum, Instructor
- Overview: "What You'll Learn" bulleted list with green checkmarks, requirements, description
- Curriculum: Expandable section accordions, lesson titles with duration and video icon

**Lesson/Video Page**:
- Video player with sidebar layout (described in components)
- Breadcrumb: Course Name > Lesson Title
- Q&A section below video: Threaded layout, "Ask Question" button

### F. Animations

**Strategic Use**:
- Page load: Content fade-in (duration-200)
- Card interactions: Hover lift (duration-150 ease-out)
- Dropdowns: Slide-down (duration-200)
- Progress bars/rings: Animated fill on viewport entry
- Tab switching: Crossfade content (duration-300)

**No animations**: Form validation states, table sorting, modal open/close (instant)

---

## Images

**Hero Image**: Full-width background showing diverse students collaborating in modern learning space with laptops and tablets. Bright, natural lighting. Overlay gradient 210 80% 48% to 175 70% 40% at 85% opacity.

**Course Thumbnails**: Category-specific high-quality images - recommend Unsplash or Pexels (search: "programming workspace", "mathematics education", "science laboratory", "business meeting"). Teachers upload custom or select from curated library.

**Empty States**: Illustrations from unDraw (education collection) - students reading, online learning, achievement themes.

**Icons**: Font Awesome 6 Pro (CDN) - solid style for primary actions, regular for secondary. Use duotone for dashboard stat card icons.

---

## Accessibility & Polish

- Focus rings: 2px Primary color ring with 2px offset on all interactive elements
- Touch targets: Minimum 44x44px for mobile interactions
- Contrast: Maintain 4.5:1 for body text, 3:1 for large text against backgrounds
- Loading states: Skeleton screens for course grids (animated pulse), spinner for form submissions
- Responsive breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px
- WhatsApp redirect: Modal explaining purchase process before external redirect