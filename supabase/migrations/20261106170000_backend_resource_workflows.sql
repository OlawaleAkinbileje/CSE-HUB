-- Keep the existing integer-ID API users table alongside Supabase auth profiles.
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TYPE public.resource_status ADD VALUE IF NOT EXISTS 'rejected';

ALTER TABLE public.resources
    ADD COLUMN IF NOT EXISTS resource_type VARCHAR(32) NOT NULL DEFAULT 'other',
    ADD COLUMN IF NOT EXISTS storage_key TEXT,
    ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255),
    ADD COLUMN IF NOT EXISTS backend_uploader_id INTEGER
        REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS resources_backend_uploader_idx
    ON public.resources (backend_uploader_id);
CREATE INDEX IF NOT EXISTS resources_created_at_idx
    ON public.resources (created_at DESC);

CREATE TABLE IF NOT EXISTS public.backend_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.backend_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS backend_comments_resource_created_idx
    ON public.backend_comments (resource_id, created_at);

CREATE TABLE IF NOT EXISTS public.backend_saved_resources (
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS public.backend_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS backend_downloads_resource_idx
    ON public.backend_downloads (resource_id, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS backend_downloads_user_idx
    ON public.backend_downloads (user_id, downloaded_at DESC);

CREATE TABLE IF NOT EXISTS public.backend_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    notification_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS backend_notifications_user_created_idx
    ON public.backend_notifications (user_id, created_at DESC);
