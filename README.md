# Ballas Fund Manager

A comprehensive organization management system for tracking resources, tasks, members, and disciplinary actions.

## Features

- **Dual-Mode Authentication**: Admin (email/password) and Guest (read-only) access modes
- **Member Management**: Track organization members with tags, notes, and profiles
- **Resource & Inventory**: Manage resource types and monitor inventory levels
- **Task System**: Create and assign tasks with resource requirements and completion tracking
- **Strike System**: Issue and track disciplinary strikes with point-based severity
- **Dashboard**: Overview with key metrics and recent activities
- **Dark Mode**: Full dark mode support with theme toggle
- **Responsive Design**: Desktop-first design that works beautifully on all devices

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL + Storage + Realtime)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Hosting**: Replit

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project credentials from Project Settings → API:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Anon/Public Key** (VITE_SUPABASE_ANON_KEY)

### 2. Database Setup

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- App users (store additional app info)
create table if not exists app_users (
  id uuid primary key default uuid_generate_v4(),
  supabase_user_id uuid,
  email text unique not null,
  display_name text,
  role text not null default 'member',
  created_at timestamptz default now()
);

-- Gang members (members you manage)
create table if not exists members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tag text,
  notes text,
  added_by uuid references app_users(id),
  created_at timestamptz default now()
);

-- Resources (types of resources)
create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  unit text default 'pcs',
  created_at timestamptz default now()
);

-- Inventory (current counts per resource)
create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  resource_id uuid references resources(id) on delete cascade,
  quantity integer not null default 0,
  updated_by uuid references app_users(id),
  updated_at timestamptz default now()
);

-- Tasks (task definitions)
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  resource_id uuid references resources(id),
  required_amount integer default 0,
  assigned_member_id uuid references members(id),
  recurrence text default 'daily',
  created_by uuid references app_users(id),
  created_at timestamptz default now()
);

-- Task completions (daily history)
create table if not exists task_completions (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  member_id uuid references members(id),
  date date not null,
  amount_collected integer default 0,
  completed boolean default false,
  noted_by uuid references app_users(id),
  noted_at timestamptz default now()
);

-- Strikes (disciplinary actions)
create table if not exists strikes (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references members(id),
  issued_by uuid references app_users(id),
  reason text,
  points integer default 1,
  created_at timestamptz default now()
);

-- Audit log (optional)
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor uuid references app_users(id),
  action text,
  meta jsonb,
  created_at timestamptz default now()
);

-- Seed data
insert into resources (name, description, unit) 
values ('autoparts', 'Car autoparts for recon', 'pcs') 
on conflict do nothing;
```

### 3. Row Level Security (RLS) Policies

Configure RLS policies in Supabase to enable admin and guest access:

```sql
-- Enable RLS on all tables
alter table app_users enable row level security;
alter table members enable row level security;
alter table resources enable row level security;
alter table inventory enable row level security;
alter table tasks enable row level security;
alter table task_completions enable row level security;
alter table strikes enable row level security;
alter table audit_logs enable row level security;

-- Guest (anonymous) users can SELECT from all tables
create policy "Allow anonymous read access on app_users"
  on app_users for select
  to anon
  using (true);

create policy "Allow anonymous read access on members"
  on members for select
  to anon
  using (true);

create policy "Allow anonymous read access on resources"
  on resources for select
  to anon
  using (true);

create policy "Allow anonymous read access on inventory"
  on inventory for select
  to anon
  using (true);

create policy "Allow anonymous read access on tasks"
  on tasks for select
  to anon
  using (true);

create policy "Allow anonymous read access on task_completions"
  on task_completions for select
  to anon
  using (true);

create policy "Allow anonymous read access on strikes"
  on strikes for select
  to anon
  using (true);

-- Authenticated users with admin role have full access
create policy "Allow admin full access on app_users"
  on app_users for all
  to authenticated
  using (
    exists (
      select 1 from app_users
      where supabase_user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Allow admin full access on members"
  on members for all
  to authenticated
  using (
    exists (
      select 1 from app_users
      where supabase_user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Allow admin full access on resources"
  on resources for all
  to authenticated
  using (
    exists (
      select 1 from app_users
      where supabase_user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Allow admin full access on inventory"
  on inventory for all
  to authenticated
  using (
    exists (
      select 1 from app_users
      where supabase_user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Allow admin full access on tasks"
  on tasks for all
  to authenticated
  using (
    exists (
      select 1 from app_users
      where supabase_user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Allow admin full access on task_completions"
  on task_completions for all
  to authenticated
  using (
    exists (
      select 1 from app_users
      where supabase_user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Allow admin full access on strikes"
  on strikes for all
  to authenticated
  using (
    exists (
      select 1 from app_users
      where supabase_user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Allow admin full access on audit_logs"
  on audit_logs for all
  to authenticated
  using (
    exists (
      select 1 from app_users
      where supabase_user_id = auth.uid() and role = 'admin'
    )
  );
```

### 4. Create Admin User

1. Go to Authentication → Users in your Supabase dashboard
2. Click "Add user" → "Create new user"
3. Use these credentials:
   - Email: `admin@ballas.local`
   - Password: `ChangeMe123!`
4. After creating the user, copy their UUID
5. Run this SQL to add them to app_users:

```sql
insert into app_users (supabase_user_id, email, display_name, role)
values ('[PASTE-USER-UUID-HERE]', 'admin@ballas.local', 'Administrator', 'admin');
```

**IMPORTANT**: Change the admin password immediately after first login!

### 5. Environment Variables

Add your Supabase credentials to Replit Secrets:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

### 6. Run the Application

```bash
npm install
npm run dev
```

The application will be available at the provided Replit URL.

## Usage

### Admin Mode
- Full CRUD access to all features
- Create, edit, and delete members, resources, tasks
- Update inventory levels
- Issue strikes
- Log task completions

### Guest Mode
- Read-only access to all data
- View dashboard metrics
- Browse members, resources, tasks, and strikes
- No ability to create, edit, or delete

## Default Credentials

- **Admin**: admin@ballas.local / ChangeMe123!
- **Guest**: No credentials required, click "Continue as Guest"

## License

MIT
