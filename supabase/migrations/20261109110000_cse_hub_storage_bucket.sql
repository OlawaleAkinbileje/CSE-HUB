INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('cse-hub-files', 'cse-hub-files', FALSE, 52428800)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit;
