ALTER TABLE public.resources
    ALTER COLUMN status SET DEFAULT 'approved';

UPDATE public.resources
SET status = 'approved'::public.resource_status,
    updated_at = NOW()
WHERE status::text = 'pending';
