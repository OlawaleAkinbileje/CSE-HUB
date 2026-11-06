-- Seed Initial Resource Categories matching Figma / UI Specs
INSERT INTO public.categories (name, slug) VALUES
('Past Questions', 'past-questions'),
('Projects', 'projects'),
('Lecture Notes', 'lecture-notes'),
('Code Samples', 'code-samples'),
('Knowledge Hub', 'knowledge-hub')
ON CONFLICT (slug) DO NOTHING;

-- Seed Standard CSE Department Courses
INSERT INTO public.courses (course_code, title, level) VALUES
('CSC 201', 'Computer Programming I', 200),
('CSC 202', 'Computer Programming II', 200),
('CSC 301', 'Data Structures and Algorithms', 300),
('CSC 305', 'Database Systems', 300),
('CSC 309', 'Object-Oriented Programming', 300),
('CSC 401', 'Software Engineering', 400),
('CSC 405', 'Operating Systems', 400),
('CSC 411', 'Computer Networks', 400),
('CSC 501', 'Artificial Intelligence', 500)
ON CONFLICT (course_code) DO NOTHING;