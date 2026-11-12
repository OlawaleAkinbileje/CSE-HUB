DO $$
DECLARE
    auth_user_count BIGINT;
    profile_count BIGINT;
    legacy_comment_count BIGINT;
    legacy_saved_count BIGINT;
    legacy_download_count BIGINT;
    legacy_notification_count BIGINT;
    unmapped_resource_owner_count BIGINT;
BEGIN
    LOCK TABLE auth.users IN ACCESS EXCLUSIVE MODE;
    LOCK TABLE public.profiles, public.comments, public.saved_resources,
               public.downloads, public.notifications, public.resources
        IN ACCESS EXCLUSIVE MODE;

    SELECT count(*) INTO auth_user_count FROM auth.users;
    SELECT count(*) INTO profile_count FROM public.profiles;
    SELECT count(*) INTO legacy_comment_count FROM public.comments;
    SELECT count(*) INTO legacy_saved_count FROM public.saved_resources;
    SELECT count(*) INTO legacy_download_count FROM public.downloads;
    SELECT count(*) INTO legacy_notification_count FROM public.notifications;
    SELECT count(*) INTO unmapped_resource_owner_count
    FROM public.resources
    WHERE uploader_id IS NOT NULL AND backend_uploader_id IS NULL;

    IF auth_user_count > 0
       OR profile_count > 0
       OR legacy_comment_count > 0
       OR legacy_saved_count > 0
       OR legacy_download_count > 0
       OR legacy_notification_count > 0
       OR unmapped_resource_owner_count > 0 THEN
        RAISE EXCEPTION
            'Refusing identity consolidation: auth.users %, profiles %, comments %, saved_resources %, downloads %, notifications %, unmapped resource owners %',
            auth_user_count, profile_count, legacy_comment_count, legacy_saved_count,
            legacy_download_count, legacy_notification_count, unmapped_resource_owner_count;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

ALTER TABLE public.resources
    DROP CONSTRAINT IF EXISTS resources_uploader_id_fkey;
ALTER TABLE public.resources
    DROP COLUMN IF EXISTS uploader_id;

ALTER TABLE public.resources
    ALTER COLUMN backend_uploader_id SET NOT NULL,
    ALTER COLUMN storage_key SET NOT NULL;

ALTER TABLE public.resources
    DROP CONSTRAINT IF EXISTS resources_backend_uploader_id_fkey;
ALTER TABLE public.resources
    ADD CONSTRAINT resources_backend_uploader_id_fkey
    FOREIGN KEY (backend_uploader_id) REFERENCES public.users(id) ON DELETE RESTRICT;

ALTER TABLE public.resources
    ADD CONSTRAINT resources_title_nonblank
        CHECK (length(btrim(title)) BETWEEN 1 AND 255),
    ADD CONSTRAINT resources_file_size_positive
        CHECK (file_size > 0),
    ADD CONSTRAINT resources_file_type_valid
        CHECK (file_type IN ('document', 'text', 'code')),
    ADD CONSTRAINT resources_resource_type_valid
        CHECK (resource_type IN ('past_question', 'project', 'lecture_note', 'code_preview', 'other')),
    ADD CONSTRAINT resources_storage_key_nonblank
        CHECK (length(btrim(storage_key)) > 0);

DROP TABLE public.comments;
DROP TABLE public.saved_resources;
DROP TABLE public.downloads;
DROP TABLE public.notifications;
DROP TABLE public.profiles;

DROP TYPE IF EXISTS public.user_role;
