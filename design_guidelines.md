# Learning Platform Design Guidelines

## Design Approach

**Selected Approach**: Hybrid - Material Design foundation with Udemy/Coursera-inspired course presentation

**Rationale**: Educational platforms require clarity and usability for learning efficiency while maintaining visual appeal to encourage engagement. Material Design provides excellent data-dense dashboard patterns, while successful EdTech platforms demonstrate effective course merchandising.

**Key References**:
- Udemy: Course cards, pricing display, category navigation
- Coursera: Clean video player interface, progress tracking
- Linear: Typography hierarchy and spacing
- Material Design: Dashboard layouts, data tables, notification systems

---

## Core Design Elements

### A. Color Palette

**Light Mode (Primary)**:
- Primary: 245 70% 55% (Vibrant indigo-blue for CTAs, active states)
- Secondary: 200 85% 50% (Cyan accent for highlights, progress indicators)
- Success: 142 71% 45% (Green for completions, achievements)
- Warning: 38 92% 50% (Amber for pending quizzes, notifications)
- Error: 0 72% 51% (Red for errors, deletion actions)
- Background: 0 0% 100% (Pure white)
- Surface: 220 13% 97% (Light gray for cards)
- Text Primary: 220 26% 14% (Near-black)
- Text Secondary: 220 9% 46% (Medium gray)

**Dark Mode Support**: Not required initially (focus on polished light mode)

**Gradient Applications**:
- Hero sections: Linear gradient from Primary to Secondary (245 70% 55% to 200 85% 50%)
- Dashboard stat cards: Subtle gradients using 10% opacity overlays
- Course thumbnails: Gradient overlays for text readability

### B. Typography

**Font Families** (via Google Fonts):
- Primary: 'Inter' - All UI elements, body text (400, 500, 600, 700 weights)
- Headings: 'Plus Jakarta Sans' - Page titles, section headers (600, 700 weights)
- Monospace: 'JetBrains Mono' - Code snippets in technical courses (400, 500)

**Type Scale**:
- Hero Headline: 4xl to 6xl (responsive)
- Page Title: 3xl to 4xl
- Section Header: 2xl
- Card Title: xl
- Body: base
- Caption/Meta: sm
- Tiny Labels: xs

### C. Layout System

**Container Widths**:
- Full viewport: Course player, hero sections
- max-w-7xl: Main content areas, course grids
- max-w-4xl: Forms, single-column content
- max-w-2xl: Text-heavy content (lesson descriptions)

**Spacing Primitives** (Tailwind units):
- Tight spacing: 2, 3
- Standard spacing: 4, 6, 8
- Section spacing: 12, 16, 20, 24
- Large gaps: 32

**Grid Layouts**:
- Course cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Dashboard stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Quiz submissions: grid-cols-1 lg:grid-cols-2

### D. Component Library

**Navigation**:
- Sticky header with logo, main navigation, user dropdown, notification bell
- Role-based menu items (Superadmin/Teacher/Student views)
- Mobile: Hamburger menu with slide-out drawer
- Breadcrumbs for deep navigation (Course > Lesson > Quiz)

**Course Cards**:
- 16:9 aspect ratio thumbnail with gradient overlay
- Category badge (top-left)
- Price tag or "FREE" badge (top-right)
- Course title (2 lines max with ellipsis)
- Teacher name with small avatar
- Star rating + enrollment count
- Progress bar for enrolled courses (student view)
- Hover: Lift shadow, scale to 102%

**Dashboard Components**:
- Stat Cards: Icon, large number, label, trend indicator
- Data Tables: Striped rows, sortable headers, action buttons
- Progress Rings: Circular completion indicators
- Activity Feed: Timeline layout with icons and timestamps
- Chart Widgets: Using Chart.js for analytics

**Video Player**:
- 16:9 responsive YouTube embed
- Custom controls overlay on hover
- Lesson sidebar (collapsible on mobile)
- Progress indicator below video
- Next/Previous lesson buttons
- Mark complete checkbox

**Forms**:
- Floating labels for text inputs
- Clear validation states (green checkmark, red error text)
- Multi-step forms for course creation (progress stepper)
- File upload: Drag-drop zone with preview for quiz images

**Buttons**:
- Primary: Solid fill with Primary color
- Secondary: Outline with Primary color
- Success: Solid fill with Success color
- Danger: Solid fill with Error color
- Ghost: Transparent with hover background
- Sizes: sm, base, lg
- Icons: Leading or trailing with 4 spacing

**Modals & Overlays**:
- Quiz submission modal with image preview
- Confirmation dialogs for deletions
- Notification dropdown (max-height with scroll)
- WhatsApp redirect modal explaining purchase process

**Notifications**:
- Toast notifications: Top-right corner, auto-dismiss (4s)
- Notification bell: Badge count indicator
- Notification dropdown: Grouped by type (Questions, Quiz submissions, Replies)
- Unread indicator: Bold text, colored dot

**Empty States**:
- Centered icon + message + CTA button
- "No courses yet" with "Create Course" button
- "No progress" with "Browse Courses" link

### E. Page-Specific Layouts

**Homepage/Course Catalog**:
- Hero: Full-width gradient with search bar, large headline "Master New Skills with Iraqi's Top Teachers"
- Category tabs or pills for filtering
- Course grid below hero
- Stats banner: "X Students Enrolled • Y Courses Available • Z Expert Teachers"

**Dashboard Pages**:
- Superadmin: 4-column stat cards, user management table, platform analytics charts, recent activity feed
- Teacher: 4-column stats (My Courses, Total Students, Pending Quizzes, Questions), course list with edit actions, student progress table
- Student: 3-column stats (Enrolled, Completed, Quiz Score Avg), continue learning section, progress rings per course

**Course Detail Page**:
- Course hero: Large thumbnail, title, teacher info, price/FREE, WhatsApp Buy button
- Tabs: Overview, Curriculum (lessons list), Reviews (future)
- "What You'll Learn" bulleted list with checkmarks
- Lesson list: Collapsible sections, video duration, lock icons for unpurchased

**Video Player/Lesson Page**:
- Left: 70% video player + lesson description below
- Right: 30% lesson sidebar with all course lessons (scrollable)
- Bottom: Q&A section (threaded comments, student question + teacher reply)

**Quiz Interface**:
- Question display with image upload zone
- Submitted solutions grid (teacher view)
- Solution preview modal with approve/feedback actions

**User Management (Superadmin)**:
- Teacher creation form: Email, auto-generate password, copy button
- User tables: Filters, search, status indicators (active/suspended)
- Bulk actions dropdown

### F. Animations

**Use Sparingly**:
- Page transitions: Fade in content (200ms)
- Card hover: Transform scale + shadow (150ms ease-out)
- Dropdown menus: Slide down (200ms)
- Progress bars: Animated fill on load
- Toast notifications: Slide in from right

**No animations** on: Form inputs, modals, table sorting

---

## Images

**Hero Image**: Full-width hero section with background image of students/learning environment. Use gradient overlay (245 70% 55% to 200 85% 50% with 75% opacity) for text readability. Search "diverse students studying online" or "modern classroom technology".

**Course Thumbnails**: Teachers upload or select from library. Placeholder images: category-specific illustrations (coding, math, science). Recommend unsplash.com or pexels.com for high-quality education imagery.

**Dashboard Illustrations**: Empty state graphics from undraw.co or storyset.com (education theme).

**Icons**: Font Awesome 6 (CDN) for all UI icons - use solid style primarily, regular for secondary actions.

---

## Accessibility & Polish

- Minimum touch target: 44x44px for mobile
- Contrast ratio: 4.5:1 for body text, 3:1 for large text
- Focus states: 2px Primary colored ring on all interactive elements
- Loading states: Skeleton screens for course grids, spinner for forms
- Error handling: Inline validation messages, toast for API errors
- WhatsApp button: Green (#25D366) with WhatsApp icon, opens in new tab
- Responsive breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)