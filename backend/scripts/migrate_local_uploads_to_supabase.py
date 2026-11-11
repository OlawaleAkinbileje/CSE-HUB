import os
from pathlib import Path
import sys

from sqlalchemy import text

# Running this file directly puts `scripts/`, not the backend root, on sys.path.
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.services.storage import save_uploaded_bytes, storage_enabled
from app.db.session import SessionLocal

UPLOAD_DIR = Path(
    os.getenv("CSE_HUB_UPLOAD_DIR", str(BACKEND_DIR / "uploads"))
).resolve()


def main() -> None:
    if not storage_enabled():
        raise RuntimeError(
            "Supabase Storage is not configured. Set its URL, bucket, and server-only service role key first."
        )

    migrated = 0
    missing = []
    with SessionLocal() as db:
        storage_keys = db.execute(
            text(
                "SELECT DISTINCT storage_key FROM public.resources "
                "WHERE storage_key IS NOT NULL"
            )
        ).scalars()

        for storage_key in storage_keys:
            local_path = (UPLOAD_DIR / storage_key).resolve()
            if not local_path.is_relative_to(UPLOAD_DIR):
                raise RuntimeError(f"Invalid stored file key: {storage_key}")
            if not local_path.is_file():
                missing.append(storage_key)
                continue
            save_uploaded_bytes(local_path.read_bytes(), storage_key)
            migrated += 1

    print(f"Copied {migrated} legacy file(s) to Supabase Storage.")
    if missing:
        print(f"{len(missing)} database file reference(s) had no matching local file.")


if __name__ == "__main__":
    main()
