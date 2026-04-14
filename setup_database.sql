-- ======================================================================================
--  Student Learning Outcome Analytics Platform - Database Schema setup
-- ======================================================================================

-- 1. Create the users table in the public schema
CREATE TABLE public.users (
  id uuid references auth.users not null primary key,
  name text,
  email text,
  role text,
  created_at timestamp with time zone default now()
);

-- 2. Turn on Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can read their own profile
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING ( auth.uid() = id );

-- 4. Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING ( auth.uid() = id );

-- 5. Trigger to automatically create a user profile
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists and recreate if needed (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ======================================================================================
-- Class Management Module
-- ======================================================================================

-- 6. Create the classes table
CREATE TABLE public.classes (
  id uuid primary key default gen_random_uuid(),
  class_name text not null,
  year integer not null,
  department text not null,
  section text not null,
  semester integer not null,
  teacher_id uuid references public.users(id) not null,
  created_at timestamp with time zone default now()
);

-- Turn on Row Level Security for classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view, insert, update their own classes
CREATE POLICY "Teachers can view their own classes" 
ON public.classes FOR SELECT USING ( auth.uid() = teacher_id );

CREATE POLICY "Teachers can insert classes" 
ON public.classes FOR INSERT WITH CHECK ( auth.uid() = teacher_id );

CREATE POLICY "Teachers can update their own classes" 
ON public.classes FOR UPDATE USING ( auth.uid() = teacher_id );

-- Policy: Wait, Students might need to see the class they belong to. 
-- For now, we will create a policy to allow reading classes if authenticated.
CREATE POLICY "Authenticated users can view classes" 
ON public.classes FOR SELECT USING ( auth.role() = 'authenticated' );


-- 7. Create the students table (Enrolled in classes)
CREATE TABLE public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade not null,
  name text not null,
  register_no text unique not null,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- Turn on Row Level Security for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view and insert students into their classes
-- Since RLS policies can't natively join to another table easily without functions or nested selects, 
-- we'll use a subquery check:
CREATE POLICY "Teachers can manage students in their classes"
ON public.students FOR ALL 
USING ( 
  EXISTS (
    SELECT 1 FROM public.classes WHERE id = class_id AND teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes WHERE id = class_id AND teacher_id = auth.uid()
  )
);

-- Policy: Students can view their own record 
-- (Assuming they log in and we map their auth.users profile to this email)
CREATE POLICY "Students can view their own record"
ON public.students FOR SELECT
USING ( email = (SELECT email FROM auth.users WHERE id = auth.uid()) );

