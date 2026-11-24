from copy import deepcopy
import re
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session


DEFAULT_ADMIN_SETTINGS: dict[str, dict[str, Any]] = {
    "generalSettings": {
        "appName": "CSE Hub",
        "academicYear": "2026 / 2027",
        "department": "Faculty of Computer Science and Engineering",
        "supportEmail": "support@oauife.edu.ng",
        "maintenanceMode": False,
    },
    "searchSettings": {
        "defaultSort": "relevance",
        "resultsPerPage": 20,
        "fullTextSearch": True,
    },
    "resourcePolicy": {
        "maxFileSize": "20 MB",
        "defaultVisibility": "Public — all visitors",
        "allowedFormats": "PDF, DOC, DOCX, PPT, PPTX, TXT, MD, PY, JS, JSX, TS, TSX, JAVA, C, H, CPP, SQL, HTML, CSS, JSON",
        "detectDuplicates": True,
    },
    "userAccess": {
        "approvedDomains": "oauife.edu.ng, student.oauife.edu.ng, pg-student.oauife.edu.ng",
        "allowSelfRegistration": True,
    },
    "notifications": {
        "systemAnnouncements": True,
    },
}


def normalize_admin_settings(value: Any) -> dict[str, dict[str, Any]]:
    source = value if isinstance(value, dict) else {}
    normalized = deepcopy(DEFAULT_ADMIN_SETTINGS)
    for section, defaults in normalized.items():
        saved = source.get(section)
        if isinstance(saved, dict):
            for key in defaults:
                if key in saved:
                    defaults[key] = saved[key]
    for section, key in (
        ("generalSettings", "maintenanceMode"),
        ("searchSettings", "fullTextSearch"),
        ("resourcePolicy", "detectDuplicates"),
        ("userAccess", "allowSelfRegistration"),
        ("notifications", "systemAnnouncements"),
    ):
        if type(normalized[section][key]) is not bool:
            normalized[section][key] = DEFAULT_ADMIN_SETTINGS[section][key]
    legacy_sorts = {
        "Relevance": "relevance",
        "Newest First": "newest",
        "Most Downloaded": "downloads",
    }
    normalized["searchSettings"]["defaultSort"] = legacy_sorts.get(
        normalized["searchSettings"]["defaultSort"],
        normalized["searchSettings"]["defaultSort"],
    )
    if normalized["searchSettings"]["defaultSort"] not in {"relevance", "newest", "downloads"}:
        normalized["searchSettings"]["defaultSort"] = "relevance"
    if str(normalized["searchSettings"]["resultsPerPage"]) not in {"10", "20", "50"}:
        normalized["searchSettings"]["resultsPerPage"] = 20
    if normalized["resourcePolicy"]["maxFileSize"] not in {"10 MB", "20 MB", "50 MB"}:
        normalized["resourcePolicy"]["maxFileSize"] = "20 MB"
    if normalized["resourcePolicy"]["defaultVisibility"] not in {
        "Public — all visitors",
        "Staff Only",
    }:
        normalized["resourcePolicy"]["defaultVisibility"] = "Public — all visitors"
    return normalized


def validate_admin_settings(settings: dict[str, dict[str, Any]]) -> None:
    general = settings["generalSettings"]
    if not str(general["appName"]).strip() or len(str(general["appName"])) > 80:
        raise ValueError("Application name must contain 1 to 80 characters.")
    if not str(general["department"]).strip() or len(str(general["department"])) > 150:
        raise ValueError("Department name must contain 1 to 150 characters.")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", str(general["supportEmail"]).strip()):
        raise ValueError("Enter a valid support email address.")
    boolean_settings = (
        ("generalSettings", "maintenanceMode"),
        ("searchSettings", "fullTextSearch"),
        ("resourcePolicy", "detectDuplicates"),
        ("userAccess", "allowSelfRegistration"),
        ("notifications", "systemAnnouncements"),
    )
    if any(type(settings[section][key]) is not bool for section, key in boolean_settings):
        raise ValueError("Boolean settings must be true or false.")
    if settings["searchSettings"]["defaultSort"] not in {"relevance", "newest", "downloads"}:
        raise ValueError("Default search sort must be relevance, newest, or downloads.")
    if str(settings["searchSettings"]["resultsPerPage"]) not in {"10", "20", "50"}:
        raise ValueError("Search results per page must be 10, 20, or 50.")

    policy = settings["resourcePolicy"]
    if policy["maxFileSize"] not in {"10 MB", "20 MB", "50 MB"}:
        raise ValueError("Maximum upload size must be 10 MB, 20 MB, or 50 MB.")
    if policy["defaultVisibility"] not in {"Public — all visitors", "Staff Only"}:
        raise ValueError("Default visibility must be public or staff only.")
    supported_formats = {
        "pdf", "doc", "docx", "ppt", "pptx", "txt", "md", "py", "js",
        "jsx", "ts", "tsx", "java", "c", "h", "cpp", "sql", "html", "css", "json",
    }
    formats = {
        item.strip().lower().lstrip(".")
        for item in str(policy["allowedFormats"]).split(",")
        if item.strip()
    }
    if not formats or formats - supported_formats:
        raise ValueError("Allowed formats contain unsupported or empty file extensions.")

    domains = {
        item.strip().lower().lstrip("@")
        for item in str(settings["userAccess"]["approvedDomains"]).split(",")
        if item.strip()
    }
    if not domains or any(not re.fullmatch(r"[a-z0-9.-]+", domain) for domain in domains):
        raise ValueError("Approved email domains must be comma-separated domain names.")


def load_admin_settings(db: Session) -> dict[str, dict[str, Any]]:
    row = db.execute(
        text("SELECT settings FROM public.admin_settings WHERE id = 1")
    ).mappings().first()
    return normalize_admin_settings(row["settings"] if row else None)


def public_admin_settings(db: Session) -> dict[str, Any]:
    settings = load_admin_settings(db)
    search = settings["searchSettings"]
    sort_values = {
        "Relevance": "relevance",
        "Newest First": "newest",
        "Most Downloaded": "downloads",
    }
    configured_sort = search["defaultSort"]
    if configured_sort not in {"relevance", "newest", "downloads"}:
        configured_sort = {
            "Relevance": "relevance",
            "Newest First": "newest",
            "Most Downloaded": "downloads",
        }.get(configured_sort, "relevance")
    try:
        results_per_page = int(search["resultsPerPage"])
    except (TypeError, ValueError):
        results_per_page = 20
    if results_per_page not in {10, 20, 50}:
        results_per_page = 20
    return {
        "appName": settings["generalSettings"]["appName"],
        "academicYear": settings["generalSettings"]["academicYear"],
        "department": settings["generalSettings"]["department"],
        "supportEmail": settings["generalSettings"]["supportEmail"],
        "maintenanceMode": settings["generalSettings"]["maintenanceMode"],
        "search": {
            "defaultSort": sort_values.get(configured_sort, configured_sort),
            "resultsPerPage": results_per_page,
            "fullTextSearch": bool(search["fullTextSearch"]),
        },
        "resourcePolicy": settings["resourcePolicy"],
        "userAccess": {
            "approvedDomains": settings["userAccess"]["approvedDomains"],
            "allowSelfRegistration": settings["userAccess"]["allowSelfRegistration"],
        },
    }
