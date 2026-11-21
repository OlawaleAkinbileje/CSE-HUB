"""Collect CSE Hub API search timings and ranked results for manual relevance judging.

Set CSE_HUB_API_BASE to the deployed FastAPI origin, add one query per line to
queries.txt, then run this file with Python. The script uses the public resource
search endpoint and does not create authenticated search-history events.
"""

import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


SEARCH_PATH = "/api/v1/resources/"
REPEATS = 5
RESULT_LIMIT = 50
TIMEOUT_SECONDS = 90
SCRIPT_DIR = Path(__file__).resolve().parent
QUERIES_FILE = SCRIPT_DIR / "queries.txt"
LATENCY_FILE = SCRIPT_DIR / "latency.csv"
RESULTS_FILE = SCRIPT_DIR / "results_top.csv"


def load_queries():
    if not QUERIES_FILE.is_file():
        raise RuntimeError(f"Query file not found: {QUERIES_FILE}")
    queries = [
        line.strip()
        for line in QUERIES_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    if not queries:
        raise RuntimeError(
            f"No queries found in {QUERIES_FILE}; add one real evaluation query per line."
        )
    return queries


def fetch_search(base_url, query):
    params = urllib.parse.urlencode(
        {"search": query, "limit": RESULT_LIMIT, "sort_by": "relevance"}
    )
    request = urllib.request.Request(
        f"{base_url}{SEARCH_PATH}?{params}",
        headers={"Accept": "application/json"},
    )

    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            status_code = response.status
            payload = response.read()
    except urllib.error.HTTPError as exc:
        raise RuntimeError(
            f"Search request failed with HTTP {exc.code} for query {query!r}."
        ) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Could not reach the search API for query {query!r}: {exc.reason}"
        ) from exc
    elapsed_ms = round((time.perf_counter() - started) * 1000, 1)

    try:
        body = json.loads(payload)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            f"Search API returned non-JSON content for query {query!r}."
        ) from exc
    if not isinstance(body, dict) or not isinstance(body.get("data"), list):
        raise RuntimeError(
            f"Search API response for query {query!r} did not contain a data list."
        )
    try:
        total_count = int(body["count"])
    except (KeyError, TypeError, ValueError) as exc:
        raise RuntimeError(
            f"Search API response for query {query!r} did not contain a valid count."
        ) from exc

    return elapsed_ms, status_code, total_count, body["data"]


def main():
    base_url = os.environ.get("CSE_HUB_API_BASE", "").strip().rstrip("/")
    if not base_url:
        raise RuntimeError(
            "Set CSE_HUB_API_BASE to the deployed FastAPI origin before running."
        )
    if not base_url.startswith(("https://", "http://")):
        raise RuntimeError("CSE_HUB_API_BASE must be an http:// or https:// URL.")
    if LATENCY_FILE.exists() or RESULTS_FILE.exists():
        raise RuntimeError(
            "latency.csv or results_top.csv already exists; move the prior evidence "
            "files before running so they are not overwritten."
        )

    queries = load_queries()
    latency_rows = []
    result_rows = []

    for query in queries:
        for run in range(1, REPEATS + 1):
            elapsed_ms, status_code, total_count, items = fetch_search(base_url, query)
            latency_rows.append(
                (
                    query,
                    run,
                    datetime.now(timezone.utc).isoformat(),
                    elapsed_ms,
                    status_code,
                    len(items),
                    total_count,
                )
            )
            if run == 1:
                for rank, item in enumerate(items[:RESULT_LIMIT], start=1):
                    if not isinstance(item, dict):
                        raise RuntimeError(
                            f"Search result {rank} for {query!r} was not an object."
                        )
                    if not item.get("id") or not item.get("title"):
                        raise RuntimeError(
                            f"Search result {rank} for {query!r} is missing its "
                            "resource ID or title."
                        )
                    result_rows.append(
                        (
                            query,
                            rank,
                            item.get("id", ""),
                            item.get("title", ""),
                            item.get("course_code", ""),
                            item.get("category", ""),
                            "",
                        )
                    )

    with LATENCY_FILE.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.writer(file)
        writer.writerow(
            (
                "query",
                "run",
                "measured_at_utc",
                "elapsed_ms",
                "http_status",
                "returned_results",
                "total_matches",
            )
        )
        writer.writerows(latency_rows)

    with RESULTS_FILE.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.writer(file)
        writer.writerow(
            (
                "query",
                "rank",
                "resource_id",
                "title",
                "course_code",
                "category",
                "relevant(1/0)",
            )
        )
        writer.writerows(result_rows)

    print(f"Recorded {len(latency_rows)} API timings for {len(queries)} queries.")
    print(f"Ranked-result file for judging: {RESULTS_FILE}")
    print(f"Timing file: {LATENCY_FILE}")
    print("No relevance judgments or benchmark scores were inferred.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
