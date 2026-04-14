-- ======================================================================================
-- Course Management and Marks Entry - Database Schema Update
-- ======================================================================================

-- 1. Create the courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL,
  course_name text NOT NULL,
  faculty text NOT NULL,
  credits integer NOT NULL CHECK (credits >= 0 AND credits <= 4),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Turn on Row Level Security for courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Teachers can view their own courses" 
ON public.courses FOR SELECT USING ( auth.uid() = teacher_id );

CREATE POLICY "Teachers can insert courses" 
ON public.courses FOR INSERT WITH CHECK ( auth.uid() = teacher_id );

CREATE POLICY "Teachers can update their own courses" 
ON public.courses FOR UPDATE USING ( auth.uid() = teacher_id );

CREATE POLICY "Teachers can delete their own courses" 
ON public.courses FOR DELETE USING ( auth.uid() = teacher_id );

-- 2. Create the course_enrollments table
CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(course_id, student_id)
);

-- Turn on Row Level Security for course_enrollments
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Policies for course_enrollments (Teacher can manage if they own the course)
CREATE POLICY "Teachers can manage enrollments for their courses"
ON public.course_enrollments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()
  )
);

-- 3. Create the marks table
CREATE TABLE public.marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  
  co1 integer DEFAULT NULL,
  co2 integer DEFAULT NULL,
  co3 integer DEFAULT NULL,
  co4 integer DEFAULT NULL,
  co5 integer DEFAULT NULL,
  
  assignment integer DEFAULT NULL,
  cycle_test1 numeric DEFAULT NULL,
  cycle_test2 numeric DEFAULT NULL,
  cycle_test3 numeric DEFAULT NULL,
  
  internal_marks numeric DEFAULT NULL,

  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Turn on Row Level Security for marks
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Policies for marks (Teacher can manage if they own the course)
CREATE POLICY "Teachers can manage marks for their courses"
ON public.marks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()
  )
);
