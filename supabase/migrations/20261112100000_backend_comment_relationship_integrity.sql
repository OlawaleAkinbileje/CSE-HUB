CREATE UNIQUE INDEX IF NOT EXISTS backend_comments_resource_id_id_uidx
    ON public.backend_comments (resource_id, id);

ALTER TABLE public.backend_comments
    ADD CONSTRAINT backend_comments_parent_same_resource_fk
    FOREIGN KEY (resource_id, parent_id)
    REFERENCES public.backend_comments (resource_id, id)
    ON DELETE CASCADE;

WITH unique_user_emails AS (
    SELECT lower(email) AS normalized_email, min(id) AS user_id
    FROM public.users
    WHERE email IS NOT NULL
    GROUP BY lower(email)
    HAVING count(*) = 1
)
UPDATE public.resources AS resource
SET backend_uploader_id = matched_user.user_id
FROM public.profiles AS profile
JOIN unique_user_emails AS matched_user
  ON matched_user.normalized_email = lower(profile.email)
WHERE resource.uploader_id = profile.id
  AND resource.backend_uploader_id IS NULL;

ALTER TABLE public.backend_search_events
    ADD COLUMN IF NOT EXISTS query_text VARCHAR(200);

ALTER TABLE public.backend_search_events
    ADD CONSTRAINT backend_search_events_query_text_valid
    CHECK (query_text IS NULL OR length(btrim(query_text)) BETWEEN 1 AND 200);

ALTER TABLE public.backend_search_events
    DROP CONSTRAINT IF EXISTS backend_search_events_user_id_fkey;

ALTER TABLE public.backend_search_events
    ADD CONSTRAINT backend_search_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS backend_search_events_history_idx
    ON public.backend_search_events (user_id, created_at DESC, id DESC);
