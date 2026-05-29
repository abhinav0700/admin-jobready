-- Migration to support redesigned auth flow

-- 1. Update colleges table
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- 2. Create pending_access_requests table
CREATE TABLE IF NOT EXISTS public.pending_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for pending_access_requests
ALTER TABLE public.pending_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view and manage pending requests"
    ON public.pending_access_requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own pending request"
    ON public.pending_access_requests
    FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can insert a pending request"
    ON public.pending_access_requests
    FOR INSERT
    WITH CHECK (true);

-- 3. Update profiles table to support statuses (default active for existing users)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('pending', 'approved', 'rejected', 'active'));

-- 4. Update the handle_new_user trigger to set new users to 'pending' by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    college_uuid UUID;
BEGIN
  -- Try to find college by domain first, then by name
  SELECT id INTO college_uuid
  FROM public.colleges
  WHERE domain = COALESCE(NEW.raw_user_meta_data->>'college_domain', split_part(NEW.email, '@', 2))
     AND is_active = true
  LIMIT 1;

  -- If not found by domain, try by name
  IF college_uuid IS NULL THEN
    SELECT id INTO college_uuid
    FROM public.colleges
    WHERE name = NEW.raw_user_meta_data->>'college'
       AND is_active = true
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, college, college_id, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    LOWER(NEW.email),
    NEW.raw_user_meta_data->>'college',
    college_uuid,
    'pending' -- Force new users to be pending until they set a password
  );

  -- Default role: student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$$;
