# Ballas Fund Manager

## Overview

Ballas Fund Manager is a comprehensive organization management dashboard for tracking resources, tasks, members, and disciplinary actions. The application supports dual authentication modes: admin access with full CRUD capabilities and guest access with read-only permissions. Built with a modern React frontend and Supabase backend, the system provides real-time data management for organizational operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with caching and automatic refetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for theming

**Design System:**
- Typography uses Inter for UI elements and Space Grotesk for headings
- Desktop-first responsive design with full mobile support
- Comprehensive dark mode implementation via CSS custom properties
- Consistent spacing using Tailwind units (2, 4, 6, 8, 12, 16)
- Color system built on HSL variables for easy theme switching

**Component Architecture:**
- Feature-based page organization (`pages/` directory)
- Reusable UI components from shadcn/ui (`components/ui/`)
- Custom context providers for authentication and global state
- Modular hooks for shared functionality (`hooks/` directory)

### Backend Architecture

**Data Layer:**
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS) policies
- **ORM**: Drizzle ORM configured for PostgreSQL (schema defined but Supabase client used for queries)
- **Schema Design**: Normalized relational database with the following core entities:
  - `app_users`: Extended user profiles linked to Supabase Auth
  - `members`: Organization members with tags and notes
  - `resources`: Resource type definitions with units
  - `inventory`: Current inventory levels per resource
  - `tasks`: Recurring tasks with resource requirements
  - `task_completions`: Completion records for tasks
  - `strikes`: Disciplinary actions with point-based severity

**API Pattern:**
- Direct Supabase client queries from frontend (serverless architecture)
- No traditional REST API layer - using Supabase's auto-generated APIs
- Real-time subscriptions available through Supabase's WebSocket support

**Server Components:**
- Express server for development (Vite middleware) and production (static file serving)
- No custom API routes currently implemented
- Storage interface defined but using in-memory implementation as placeholder

### Authentication & Authorization

**Dual Authentication Modes:**
1. **Admin Mode**: 
   - Email/password authentication via Supabase Auth
   - Full CRUD operations on all entities
   - Role stored in `app_users.role` field
   
2. **Guest Mode**:
   - No credentials required
   - Read-only access enforced at UI level
   - Uses Supabase anonymous key with RLS policies

**Security Model:**
- Row Level Security (RLS) policies in Supabase for data access control
- Session management handled by Supabase Auth
- Authentication state managed via React Context (`AuthContext`)
- Protected routes redirect unauthenticated users to login

### State Management Strategy

**Server State (React Query):**
- Automatic caching and background refetching
- Optimistic updates for mutations
- Query invalidation on successful mutations
- Centralized query configuration in `queryClient.ts`

**Client State:**
- React Context for authentication state
- Local component state for UI interactions (forms, dialogs)
- Theme preference stored in localStorage

### Development & Build Pipeline

**Development:**
- Vite dev server with HMR (Hot Module Replacement)
- TypeScript compilation with strict mode enabled
- Path aliases for clean imports (`@/`, `@shared/`)
- Replit-specific plugins for development banners and error overlays

**Production:**
- Vite builds optimized client bundle to `dist/public`
- esbuild bundles Express server to `dist/index.js`
- Static file serving for SPA routing
- Environment variables for Supabase configuration

## External Dependencies

### Core Services

**Supabase** (Primary Backend):
- PostgreSQL database hosting
- Authentication service (Auth)
- Real-time subscriptions
- Auto-generated REST APIs
- Row Level Security enforcement
- Required environment variables:
  - `VITE_SUPABASE_URL`: Project URL
  - `VITE_SUPABASE_ANON_KEY`: Anonymous/public API key

**Neon Database** (Alternative/Development):
- Serverless PostgreSQL option configured via Drizzle
- Connection via `DATABASE_URL` environment variable
- Note: Currently using Supabase client, but Drizzle schema suggests potential migration path

### Third-Party Libraries

**UI & Styling:**
- Radix UI: Unstyled accessible component primitives
- Tailwind CSS: Utility-first styling framework
- class-variance-authority: Component variant management
- cmdk: Command palette component
- lucide-react: Icon library

**Data & Forms:**
- @tanstack/react-query: Server state management
- react-hook-form: Form state and validation
- @hookform/resolvers: Zod integration for form validation
- zod: Schema validation
- date-fns: Date manipulation and formatting

**Development:**
- TypeScript: Static type checking
- Vite: Build tool and dev server
- tsx: TypeScript execution for Node.js
- Replit plugins: Development experience enhancements

### Database Schema Design

The application uses a relational schema with foreign key relationships:
- Users are linked to Supabase Auth via `supabase_user_id`
- Members track who added them via `added_by` foreign key
- Tasks reference resources and assigned members
- Task completions link tasks and members
- Strikes reference members for disciplinary tracking
- Inventory tracks quantities per resource type

All tables use UUID primary keys and include `created_at` timestamps for audit trails.