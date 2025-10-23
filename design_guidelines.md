# Tutor SG - Design Guidelines

## Design Approach: Professional Education Platform
**Selected System**: Clean, modern web standards with Material Design principles
**Rationale**: Educational job-matching platform requiring clear information hierarchy, professional aesthetics, and data-dense layouts

## Core Design Principles
1. **Trust & Professionalism**: Inspire confidence in tutors and parents
2. **Information Clarity**: Complex data presented simply
3. **Efficiency**: Quick scanning and decision-making
4. **Singapore Context**: Clean, modern, education-focused

---

## Color Palette

### Light Mode
- **Primary**: 220 75% 45% (Professional blue - trust, education)
- **Primary Hover**: 220 75% 40%
- **Secondary**: 145 60% 45% (Success green - approved, active)
- **Background**: 0 0% 98% (Clean white-gray)
- **Surface**: 0 0% 100% (Pure white cards)
- **Text Primary**: 220 15% 15%
- **Text Secondary**: 220 10% 45%
- **Border**: 220 15% 88%
- **Warning**: 35 90% 55% (Pending status)
- **Danger**: 0 75% 50% (Suspended, errors)

### Dark Mode
- **Primary**: 220 75% 55%
- **Primary Hover**: 220 75% 60%
- **Secondary**: 145 55% 50%
- **Background**: 220 15% 10%
- **Surface**: 220 12% 14%
- **Text Primary**: 220 10% 95%
- **Text Secondary**: 220 8% 65%
- **Border**: 220 12% 22%

---

## Typography

**Font Families**:
- Primary: `'Inter', system-ui, -apple-system, sans-serif` (clean, professional)
- Monospace: `'JetBrains Mono', monospace` (for IDs, codes)

**Scale**:
- Hero/H1: text-4xl/text-5xl (36px/48px), font-bold
- H2: text-3xl (30px), font-semibold
- H3: text-2xl (24px), font-semibold
- H4: text-xl (20px), font-medium
- Body: text-base (16px), font-normal
- Small: text-sm (14px)
- Caption: text-xs (12px)

**Line Height**: leading-relaxed (1.625) for readability

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16, 20**
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Form fields: space-y-4

**Container Widths**:
- Max content: max-w-7xl
- Dashboard: max-w-6xl
- Forms: max-w-md to max-w-lg
- Cards: Full width within grid

**Grid System**:
- Job listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard stats: grid-cols-2 lg:grid-cols-4
- Forms: Single column with proper grouping

---

## Component Library

### Navigation
- Sticky header with logo, nav links, user menu
- Mobile: Hamburger menu with slide-in drawer
- Active state: Primary color underline/background
- Height: h-16

### Cards
- Background: Surface color
- Border: 1px border color
- Radius: rounded-lg
- Shadow: shadow-sm, hover:shadow-md transition
- Padding: p-6

### Buttons
- Primary: bg-primary, text-white, hover state
- Secondary: border-2, hover:bg-surface
- Sizes: py-2 px-4 (default), py-3 px-6 (large)
- Radius: rounded-md
- No custom animations

### Forms
- Input height: h-11
- Border: 2px on focus (primary color)
- Labels: text-sm font-medium mb-2
- Error states: Red border + text-sm text-danger
- Field grouping: space-y-4

### Job Cards
- Image/Icon placeholder top
- Subject + Level (text-lg font-semibold)
- Rate, Location, Schedule (grid-cols-2 text-sm)
- Status badge (top-right corner)
- Apply button (full width at bottom)

### Profile Cards (Tutors)
- Avatar placeholder (w-20 h-20 rounded-full)
- Name, Subjects, Experience
- Hourly rate range
- View Profile button
- Status indicator (colored dot)

### Status Badges
- Pill shape: px-3 py-1 rounded-full text-xs font-medium
- Open/Active: Green background
- Pending: Orange/Yellow background
- Filled/Suspended: Gray/Red background

### Filters (Job Listings)
- Horizontal scroll on mobile
- Button-style tags: border, rounded-full, px-4 py-2
- Active: Primary background
- Multi-select with checkboxes in dropdown (desktop)

### Dashboard Stats
- Card with large number (text-3xl font-bold)
- Label below (text-sm text-secondary)
- Icon (top-left, text-primary)
- 2x2 grid on mobile, 4-column on desktop

### Tables (Admin)
- Striped rows (even:bg-surface/50)
- Sticky header
- Action buttons (icon buttons, text-sm)
- Mobile: Card-based view

---

## Page-Specific Layouts

### Landing Page
- **Hero Section**: 
  - Clean, professional design
  - H1: "Find Quality Tutors in Singapore"
  - Subheading: Platform benefits
  - CTA buttons: "Find a Tutor" + "Become a Tutor"
  - Background: Subtle gradient (primary 5% to secondary 5%)
  - Height: min-h-[500px]
  
- **Trust Section**: Stats (tutors, jobs, success rate)
- **How It Works**: 3-column grid
- **Subject Categories**: Grid of clickable cards
- **CTA Section**: "Join Tutor SG Today"

### Dashboard (Tutor)
- Top: Welcome message + quick stats
- Profile completion progress bar
- Tabs: Overview, My Applications, Profile Settings
- Job recommendations section

### Job Listings
- Left sidebar: Filters (hidden on mobile, drawer)
- Main: Job cards grid
- Pagination or "Load More"

### Admin Dashboard
- Side navigation (collapsible)
- Main content area with tabs
- Data tables with search/filter

---

## Images

**Hero Section**: Professional image of tutor with student (subtle, blurred background). Place as background with overlay (bg-black/40) for text readability.

**Job Cards**: Use icon placeholders (book, calculator, language icons via Heroicons) instead of images.

**Tutor Profiles**: Avatar placeholders (initials or generic icon).

**Landing Features**: Small icons (Heroicons) next to text, no large images.

---

## Accessibility
- Focus states: ring-2 ring-primary ring-offset-2
- Contrast ratio: WCAG AA compliant
- Dark mode: Consistent across all inputs and surfaces
- Keyboard navigation: Full support
- Screen reader labels on icons

---

## Responsive Breakpoints
- Mobile: < 768px (single column, compact spacing)
- Tablet: 768px-1024px (2 columns where appropriate)
- Desktop: > 1024px (full layouts)

**No animations** except subtle hover transitions (200ms ease).