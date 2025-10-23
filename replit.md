# Tutor SG - Replit Configuration

## Overview

Tutor SG is a professional tuition job-matching platform for Singapore. The application connects tutors with students by allowing tutors to create profiles, browse job listings, and apply for assignments. Admins manage tutor approvals and post tuition opportunities. The platform emphasizes trust, professionalism, and efficient information presentation suitable for the Singapore education market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing with the following main routes:
- Landing page (`/`)
- Registration (`/register`)
- Login (`/login`)
- Jobs listing (`/jobs`)
- Tutor dashboard (`/dashboard`)
- Admin panel (`/admin`)
- Tuition rates reference (`/tuition-rates`)

**UI Component Library**: shadcn/ui components with Radix UI primitives
- Design system based on "new-york" style variant
- Custom theme with light/dark mode support
- Professional blue primary color (220 75% 45%) for trust and education
- Material Design principles for clean, modern aesthetics
- Typography using Inter font family for professional appearance

**State Management**: 
- TanStack React Query v5 for server state management and caching
- Local storage for authentication tokens (tutorId and userType)
- React Hook Form with Zod validation for form handling

**Styling**: 
- Tailwind CSS with custom configuration
- CSS variables for theme management
- Custom elevation classes (hover-elevate, active-elevate-2) for interactive feedback
- Responsive design with mobile-first approach

### Backend Architecture

**Framework**: Express.js server with TypeScript

**API Design**: RESTful endpoints under `/api` prefix:
- `/api/auth/*` - Authentication routes (register, login for tutors and admins)
- `/api/jobs/*` - Job listing CRUD operations
- `/api/applications/*` - Application submission and tracking
- `/api/tutors/*` - Tutor profile management
- `/api/admin/*` - Admin operations

**Authentication**: 
- Session-based authentication using bcryptjs for password hashing
- Role-based access control (tutor vs admin)
- No JWT - relies on server-side session management with connect-pg-simple

**Development Server**: 
- Vite middleware integration for hot module replacement
- Development/production mode differentiation via NODE_ENV
- Custom request logging middleware

### Data Layer

**ORM**: Drizzle ORM with schema-first approach

**Database Schema**:
- `tutors` - User profiles with subjects, levels, rates, qualifications, status (Pending/Active/Suspended)
- `jobs` - Tuition assignments with subject, level, location, schedule, status (Open/Under Review/Filled)
- `applications` - Junction table linking tutors to jobs with application status
- `admins` - Admin user accounts

**Connection**: 
- Neon serverless PostgreSQL via `@neondatabase/serverless`
- WebSocket support for real-time connections
- Connection pooling for performance

**Schema Validation**: Zod schemas generated from Drizzle tables using `drizzle-zod` for type-safe API validation

### Build & Deployment

**Build Process**:
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Single build command produces deployable artifacts

**Scripts**:
- `dev` - Development mode with hot reload
- `build` - Production build
- `start` - Run production server
- `db:push` - Push schema changes to database

**Module System**: ES Modules throughout (type: "module" in package.json)

## External Dependencies

### Core Framework Dependencies
- **React 18** - UI framework
- **Express** - Backend server
- **TypeScript** - Type safety across the stack
- **Vite** - Build tool and dev server

### Database
- **PostgreSQL** - Primary database (via Neon serverless)
- **Drizzle ORM** - Type-safe database queries and migrations
- **@neondatabase/serverless** - Serverless PostgreSQL client with WebSocket support

### UI Libraries
- **shadcn/ui** - Component system built on Radix UI primitives
- **Radix UI** - Headless accessible component primitives (accordion, dialog, dropdown, etc.)
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **React Icons** - Additional icons (SiTelegram)

### Form & Validation
- **React Hook Form** - Form state management
- **Zod** - Runtime type validation and schema generation
- **@hookform/resolvers** - Zod integration with React Hook Form

### State Management
- **TanStack React Query** - Server state, caching, and data fetching
- **Wouter** - Lightweight client-side routing

### Authentication & Security
- **bcryptjs** - Password hashing
- **connect-pg-simple** - PostgreSQL session store

### Development Tools
- **tsx** - TypeScript execution for development
- **esbuild** - Fast JavaScript bundler for production
- **@replit/vite-plugin-runtime-error-modal** - Error overlay for development
- **@replit/vite-plugin-cartographer** - Development tooling
- **@replit/vite-plugin-dev-banner** - Development banner

### Utilities
- **date-fns** - Date manipulation
- **clsx** & **tailwind-merge** - Conditional class name handling
- **class-variance-authority** - Component variant management
- **cmdk** - Command menu component
- **nanoid** - Unique ID generation