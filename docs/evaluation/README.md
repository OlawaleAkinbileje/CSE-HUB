# CSE Hub evaluation evidence collection

This folder contains a collector configured for the current FastAPI search
contract and an intentionally empty query-list template. It does not contain
benchmark results. Collect and retain the evidence below before reporting
Chapter Four values.

## Search and live API latency

1. Confirm the deployed environment and release, and verify that
   `https://<backend-origin>/health` returns the FastAPI health JSON. Do not run
   the collector while the service returns a hosting interstitial, `503`, or an
   unexpected response.
2. Freeze and record the resource collection date and its size. Select the final
   query set from that collection before measuring; retain the exact query file.
3. Set `CSE_HUB_API_BASE` to the FastAPI origin, add one query per line to
   `queries.txt`, and run `python measure_search.py` from this folder. The
   endpoint is `GET /api/v1/resources/?search=<query>&limit=50&sort_by=relevance`.
   It returns `{data, count}`. Five requests per query are recorded; the first
   response for each query supplies the top-50 judging list.
4. The collector uses the public search endpoint without authentication, so it
   does not create authenticated search-history records. It records API
   request/response time, not browser rendering time or a client-side cached
   response.
5. Preserve `latency.csv` and `results_top.csv`. The collector refuses to
   overwrite existing evidence files.

## Relevance judgments and retrieval metrics

- Judge relevance against a written rule applied consistently (for example,
  whether the resource directly addresses the query's course/topic need).
- Use resource IDs, not titles alone, to identify relevant records.
- `P@10 = relevant results among ranks 1–10 / 10`.
- `R@50 = relevant retrieved in ranks 1–50 / all relevant resources in the
  frozen collection for that query`.
- The recall denominator must be based on a relevance set established for the
  fixed collection, not merely the relevant items found in the returned top 50.
  Preserve the query list, full judged relevant-ID set, ranked result file, and
  calculation record.
- Report the mean query-level P@10 and R@50. Do not report F1 computed from
  P@10 and R@50 because they use different cut-offs.

The supplied calculator workbook includes a per-query F1 formula that combines
P@10 and R@50. Do not report that F1 column; use the thesis instruction that
F1 is omitted when precision and recall use different cut-offs.

## Constrained network, cached responses, and SUS

- The Python collector measures live API requests and does not apply Chrome
  network throttling or measure browser cache. For a constrained-network
  profile, record the exact throttling profile, date, client, cache state, and
  measurement boundary. Keep those timings separate from live API timings.
- Report client-side cached query timings separately; do not compare them as
  network response times.
- SUS requires actual voluntary participant responses. Retain the ten raw
  answers per respondent, anonymous respondent count, collection date, and
  scoring sheet. Do not invent, backfill, or present assistant-generated
  answers as participant data. Follow applicable university consent and
  research-ethics requirements.
- Keep any participant feedback anonymous unless identifiable collection was
  approved and necessary.
