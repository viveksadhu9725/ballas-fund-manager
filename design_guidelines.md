# Ballas Fund Manager - Design Guidelines

## Design Approach
**System-Based Approach using shadcn/ui** - This dashboard-focused application prioritizes efficiency and data clarity while maintaining visual polish. shadcn/ui provides the robust component foundation needed for complex data tables, forms, and admin interfaces.

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) for UI elements, data tables, forms
- Headings: Space Grotesk (Google Fonts) for dashboard titles and section headers

**Hierarchy:**
- Page Titles: text-4xl font-bold (Space Grotesk)
- Section Headers: text-2xl font-semibold (Space Grotesk)
- Card Titles: text-lg font-medium (Inter)
- Body Text: text-base (Inter)
- Data Tables: text-sm (Inter)
- Labels/Captions: text-xs font-medium uppercase tracking-wide

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 consistently
- Component padding: p-6
- Card spacing: gap-4 between elements, p-8 for card bodies
- Section margins: mb-12 between major sections
- Grid gaps: gap-6 for card grids

**Container Structure:**
- Main dashboard: max-w-7xl mx-auto with px-6
- Sidebar navigation: Fixed left, w-64, full height
- Content area: ml-64 with proper padding
- Modal dialogs: max-w-2xl for forms, max-w-4xl for data-heavy modals

## Component Library

**Navigation:**
- Fixed sidebar with logo at top, navigation items with icons (Heroicons), user profile at bottom
- Top bar with breadcrumbs, quick actions, and admin/guest mode indicator badge
- Mobile: Collapsible hamburger menu with slide-out drawer

**Dashboard Cards:**
- Stat cards in 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Each card: icon in top-left, large number display, label below, subtle trend indicator
- Recent activity feed: Timeline-style list with avatars and timestamps

**Data Tables:**
- shadcn/ui data table with sortable columns, pagination, search
- Row actions in rightmost column (dropdown menu)
- Zebra striping for readability
- Sticky headers for long tables

**Forms:**
- Two-column layout for optimal space usage (grid-cols-2 gap-6)
- Full-width for textarea fields
- Inline validation with clear error states
- Action buttons right-aligned with primary/secondary hierarchy

**Modals:**
- Slide-in panels for quick actions (member details, strike logging)
- Centered modals for complex forms (task creation, resource management)
- Confirmation dialogs with clear destructive action warnings

**Member Cards:**
- Profile avatar (generated initials or icon), name, tag, membership date
- Quick action buttons: Edit, View Tasks, Add Strike
- Strike count badge in top-right corner

**Task Management:**
- Kanban-style columns: Pending, In Progress, Completed
- Task cards with assigned member avatar, progress bar, due date
- Drag-and-drop enabled for status updates

**Auth Page:**
- Split-screen layout: Left side brand/logo (40%), right side login form (60%)
- Admin/Guest toggle as prominent segmented control above form
- Guest mode: Single "Continue as Guest" button with explanation text
- Admin mode: Email/password fields with "Sign In" button

## Animations
- Minimal and purposeful only
- Page transitions: Simple fade-in (300ms)
- Card hovers: Subtle lift with shadow increase
- Button interactions: Built-in shadcn/ui states only
- Data updates: Brief highlight flash on changed values

## Icons
**Heroicons (outline style via CDN)** for all interface icons:
- Navigation: home, users, archive, clipboard-list, shield-exclamation
- Actions: plus, pencil, trash, check, x-mark
- Status indicators: clock, check-circle, exclamation-triangle

## Images

**Logo/Hero:**
- Use provided logo (`/mnt/data/New Project.png`) in sidebar header (h-12 w-auto)
- Auth page: Display logo prominently on left split (max-w-sm centered)

**Member Avatars:**
- Use initial-based generated avatars (using member name initials)
- Circular, 40x40px in lists, 96x96px in detail views
- Fallback to user icon from Heroicons if no name

**No additional imagery required** - this is a data-focused dashboard where clarity trumps decoration.

## Responsive Behavior
- Desktop (lg+): Full sidebar, multi-column grids, expanded data tables
- Tablet (md): Collapsed sidebar (icon-only), 2-column grids
- Mobile: Hidden sidebar (hamburger menu), single-column stacked layout, simplified table views (card-based)

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support throughout
- Focus indicators with visible outlines
- Color contrast meeting WCAG AA standards
- Screen reader-friendly table structures