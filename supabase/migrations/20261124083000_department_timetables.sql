CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    faculty VARCHAR(150),
    program VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.departments (slug, name, faculty, program)
VALUES
    ('computer-engineering', 'Computer Engineering',
        'Faculty of Computer Science and Engineering',
        'B.Sc. Computer Engineering; B.Sc. ICT'),
    ('computer-science-and-cyber-security', 'Computer Science and Cyber Security',
        'Faculty of Computer Science and Engineering',
        'B.Sc. Computer Science with Mathematics; B.Sc. Computer Science with Economics; Cyber Security'),
    ('information-system', 'Information System',
        'Faculty of Computer Science and Engineering',
        'B.Sc. Information Systems'),
    ('intelligent-system-engineering', 'Intelligent System Engineering',
        'Faculty of Computer Science and Engineering',
        'B.Sc. Intelligent System Engineering'),
    ('software-engineering', 'Software Engineering',
        'Faculty of Computer Science and Engineering',
        'B.Sc. Software Engineering')
ON CONFLICT (slug) DO UPDATE
SET faculty = EXCLUDED.faculty, program = EXCLUDED.program;

CREATE TABLE public.department_access_codes (
    department_id UUID PRIMARY KEY
        REFERENCES public.departments(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.department_timetable_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL
        REFERENCES public.departments(id) ON DELETE CASCADE,
    entry_type VARCHAR(16) NOT NULL
        CHECK (entry_type IN ('class', 'exam', 'event')),
    title VARCHAR(150) NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 150),
    course_code VARCHAR(20),
    day_of_week SMALLINT CHECK (day_of_week BETWEEN 1 AND 7),
    schedule_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(200),
    notes TEXT,
    created_by INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time),
    CHECK (
        (entry_type = 'class' AND day_of_week IS NOT NULL AND schedule_date IS NULL)
        OR
        (entry_type IN ('exam', 'event') AND day_of_week IS NULL AND schedule_date IS NOT NULL)
    )
);

CREATE INDEX department_timetable_department_day_idx
    ON public.department_timetable_entries (department_id, day_of_week, start_time);
CREATE INDEX department_timetable_department_date_idx
    ON public.department_timetable_entries (department_id, schedule_date, start_time);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_timetable_entries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users
    ADD COLUMN department_id UUID
        REFERENCES public.departments(id) ON DELETE SET NULL;
CREATE INDEX users_department_id_idx ON public.users (department_id);

INSERT INTO public.courses (course_code, title, level, category_id)
VALUES ('PROJECT-THESIS', 'Project Thesis', 400, NULL)
ON CONFLICT (course_code) DO NOTHING;
