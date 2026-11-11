from urllib import error, request
from urllib.parse import quote

from fastapi import HTTPException

from app.config import settings as supabase_settings


def storage_enabled() -> bool:
    return bool(
        getattr(supabase_settings, "USE_SUPABASE_STORAGE", True)
        and getattr(supabase_settings, "SUPABASE_URL", "")
        and getattr(supabase_settings, "SUPABASE_SERVICE_ROLE_KEY", "")
        and not str(getattr(supabase_settings, "SUPABASE_SERVICE_ROLE_KEY", "")).startswith(
            ("sb_publishable_", "sb_anon_")
        )
        and getattr(supabase_settings, "SUPABASE_STORAGE_BUCKET", "")
    )


def _supabase_storage_url(storage_key: str) -> str:
    base_url = str(getattr(supabase_settings, "SUPABASE_URL", "")).rstrip("/")
    bucket = str(getattr(supabase_settings, "SUPABASE_STORAGE_BUCKET", "")).strip("/")
    safe_key = quote(storage_key, safe="/")
    return f"{base_url}/storage/v1/object/{bucket}/{safe_key}"


def save_uploaded_bytes(file_bytes: bytes, storage_key: str) -> None:
    if not storage_enabled():
        raise HTTPException(
            status_code=503,
            detail=(
                "Supabase Storage is not configured correctly. Set SUPABASE_URL, "
                "SUPABASE_STORAGE_BUCKET, and a server-only SUPABASE_SERVICE_ROLE_KEY "
                "(never a publishable or anon key)."
            ),
        )

    url = _supabase_storage_url(storage_key)
    headers = {
        "Authorization": f"Bearer {supabase_settings.SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": supabase_settings.SUPABASE_SERVICE_ROLE_KEY,
        "x-upsert": "true",
        "Content-Type": "application/octet-stream",
    }
    request_obj = request.Request(url, data=file_bytes, headers=headers, method="PUT")
    try:
        with request.urlopen(request_obj, timeout=30) as response:
            response.read()
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to upload file to Supabase Storage: {detail or exc.reason}",
        ) from exc
    except error.URLError as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to reach the Supabase Storage service.",
        ) from exc


def read_stored_bytes(storage_key: str) -> bytes:
    if not storage_enabled():
        raise HTTPException(
            status_code=503,
            detail=(
                "Supabase Storage is not configured correctly. Set SUPABASE_URL, "
                "SUPABASE_STORAGE_BUCKET, and a server-only SUPABASE_SERVICE_ROLE_KEY "
                "(never a publishable or anon key)."
            ),
        )

    url = _supabase_storage_url(storage_key)
    headers = {
        "Authorization": f"Bearer {supabase_settings.SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": supabase_settings.SUPABASE_SERVICE_ROLE_KEY,
    }
    request_obj = request.Request(url, headers=headers, method="GET")
    try:
        with request.urlopen(request_obj, timeout=30) as response:
            return response.read()
    except error.HTTPError as exc:
        if exc.code in (401, 403):
            raise HTTPException(status_code=403, detail="Storage access is not permitted.") from exc
        raise HTTPException(status_code=404, detail="Resource file is unavailable") from exc
    except error.URLError as exc:
        raise HTTPException(status_code=502, detail="Unable to reach the Supabase Storage service.") from exc
