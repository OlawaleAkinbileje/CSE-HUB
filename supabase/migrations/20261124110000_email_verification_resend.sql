ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS verification_token_hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS users_verification_token_hash_idx
    ON public.users (verification_token_hash)
    WHERE verification_token_hash IS NOT NULL;
