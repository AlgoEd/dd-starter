"""
puck-update — safe puckData write helper.

Two modes:
  api  (default): PATCH via Payload REST API. Versioning + hooks handled by Payload.
  sql:            Two-table sync — UPDATE pages + UPDATE _pages_v.latest in one tx.
                  Skips versioning. Use for batch migrations where API latency matters.

Both modes leave pages.puck_data and _pages_v.latest.version_puck_data in sync so future
API PATCHes won't clobber with stale draft content.

Usage:
  python3 scripts/puck-update.py --id 28 --data page28.json             # api mode
  python3 scripts/puck-update.py --id 28 --data page28.json --mode sql  # sql mode

Environment:
  PAYLOAD_SESSION_COOKIE  required for api mode
  DATABASE_URL or PGPASSWORD + PG*  required for sql mode
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

PAYLOAD_BASE = os.environ.get("PAYLOAD_BASE", "https://pages.algoed.co")
PSQL = "/opt/homebrew/opt/postgresql@17/bin/psql"
DB_ARGS = ["-h", "gondola.proxy.rlwy.net", "-p", "43742", "-U", "postgres", "-d", "payload_cms", "-tA"]


def _pg_env():
    pw = os.environ.get("PGPASSWORD")
    if not pw:
        sys.exit("PGPASSWORD required for sql mode")
    return {"PGPASSWORD": pw, "PATH": os.environ.get("PATH", "")}


def update_api(page_id: int, puck_data: dict) -> None:
    cookie = os.environ.get("PAYLOAD_SESSION_COOKIE")
    if not cookie:
        sys.exit("PAYLOAD_SESSION_COOKIE required for api mode")
    body = json.dumps({"puckData": puck_data})
    result = subprocess.run(
        [
            "curl", "-sS", "-X", "PATCH", f"{PAYLOAD_BASE}/api/pages/{page_id}",
            "-H", f"Cookie: {cookie}",
            "-H", "Content-Type: application/json",
            "-d", body,
            "-w", "\nHTTP %{http_code}\n",
        ],
        capture_output=True, text=True, check=True,
    )
    print(result.stdout)
    if "HTTP 200" not in result.stdout:
        sys.exit("api update failed")


def update_sql(page_id: int, puck_data: dict) -> None:
    """Two-table sync. Ensures pages.puck_data and _pages_v.latest stay aligned."""
    payload = json.dumps(puck_data)
    escaped = payload.replace("'", "''")
    sql = (
        "BEGIN;\n"
        f"UPDATE pages SET puck_data = '{escaped}'::jsonb WHERE id = {page_id};\n"
        f"UPDATE _pages_v SET version_puck_data = '{escaped}'::jsonb "
        f"WHERE parent_id = {page_id} AND latest = true;\n"
        "COMMIT;"
    )
    subprocess.run([PSQL, *DB_ARGS, "-c", sql], env=_pg_env(), check=True, capture_output=True)
    print(f"sql mode: page {page_id} synced (pages + _pages_v.latest)")


def revalidate() -> None:
    cookie = os.environ.get("PAYLOAD_SESSION_COOKIE")
    if not cookie:
        return
    subprocess.run(
        ["curl", "-sS", "-X", "POST", f"{PAYLOAD_BASE}/api/revalidate-all",
         "-H", f"Cookie: {cookie}", "-o", "/dev/null", "-w", "revalidate: %{http_code}\n"],
        check=True,
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", type=int, required=True, help="page id")
    ap.add_argument("--data", required=True, help="path to JSON file with new puckData")
    ap.add_argument("--mode", choices=["api", "sql"], default="api")
    ap.add_argument("--no-revalidate", action="store_true")
    args = ap.parse_args()

    puck_data = json.loads(Path(args.data).read_text())
    if args.mode == "api":
        update_api(args.id, puck_data)
    else:
        update_sql(args.id, puck_data)
    if not args.no_revalidate:
        revalidate()


if __name__ == "__main__":
    main()
