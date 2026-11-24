ALTER TABLE public.resources
    ADD COLUMN IF NOT EXISTS visibility VARCHAR(16) NOT NULL DEFAULT 'public',
    ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'resources_visibility_valid'
          AND conrelid = 'public.resources'::regclass
    ) THEN
        ALTER TABLE public.resources
            ADD CONSTRAINT resources_visibility_valid
                CHECK (visibility IN ('public', 'staff_only'));
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS resources_content_hash_idx
    ON public.resources (content_hash)
    WHERE content_hash IS NOT NULL;
