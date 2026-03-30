-- Add sample colleges for testing
INSERT INTO public.colleges (name, domain, is_active) VALUES
('Sri Venkateswara College of Engineering', 'svce.ac.in', true),
('Stanford University', 'stanford.edu', true),
('MIT', 'mit.edu', true),
('Harvard University', 'harvard.edu', true),
('UC Berkeley', 'berkeley.edu', true),
('Carnegie Mellon University', 'cmu.edu', true)
ON CONFLICT (domain) DO NOTHING;

-- Add sample users for testing (using the college IDs)
-- First, get the college IDs
DO $$
DECLARE
    svce_id UUID;
    stanford_id UUID;
    mit_id UUID;
BEGIN
    SELECT id INTO svce_id FROM public.colleges WHERE domain = 'svce.ac.in' LIMIT 1;
    SELECT id INTO stanford_id FROM public.colleges WHERE domain = 'stanford.edu' LIMIT 1;
    SELECT id INTO mit_id FROM public.colleges WHERE domain = 'mit.edu' LIMIT 1;

    -- Insert sample users
    INSERT INTO public.users (email, username, password_hash, college_id, is_password_changed, role) VALUES
    ('john.doe@svce.ac.in', 'john.doe', '$2a$10$example.hash.here', svce_id, true, 'student'),
    ('jane.smith@svce.ac.in', 'jane.smith', '$2a$10$example.hash.here', svce_id, false, 'student'),
    ('admin@svce.ac.in', 'admin', '$2a$10$example.hash.here', svce_id, true, 'college_admin'),
    ('student@stanford.edu', 'stanford_student', '$2a$10$example.hash.here', stanford_id, true, 'student'),
    ('prof@mit.edu', 'mit_prof', '$2a$10$example.hash.here', mit_id, true, 'college_admin')
    ON CONFLICT (email) DO NOTHING;
END $$;