#!/usr/bin/env python3
"""Check every URL in the reference markdown files and report rot.

Usage:
    python3 scripts/check_links.py references/
    python3 scripts/check_links.py references/qa.md --timeout 30

Exit code is 1 if any link looks genuinely dead, 0 otherwise.

Some well-known hosts (doi.org, dl.acm.org, w3.org, ...) reject scripted
requests with 403/429 while working fine in a browser. Those are reported as
BLOCKED rather than DEAD so a bot policy change doesn't get mistaken for rot.
"""

import argparse
import concurrent.futures
import pathlib
import re
import ssl
import subprocess
import sys
import urllib.error
import urllib.request

URL_RE = re.compile(r"https?://[^\s<>()\[\]\"']+")

# Hosts known to block automated requests. A non-200 from these is not evidence
# the link is dead; verify by hand in a browser before removing an entry.
BOT_BLOCKING_HOSTS = (
    "doi.org",
    "dl.acm.org",
    "w3.org",
    "iso.org",
    "medium.com",
    "queue.acm.org",
    "scholar.harvard.edu",
    "storage.googleapis.com",
    "ieeexplore.ieee.org",
    "link.springer.com",
    "sciencedirect.com",
    "researchgate.net",
    "hbr.org",
)

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)


def collect_urls(target: pathlib.Path) -> dict[str, list[str]]:
    """Map each URL to the files it appears in."""
    files = sorted(target.rglob("*.md")) if target.is_dir() else [target]
    found: dict[str, list[str]] = {}
    for path in files:
        for match in URL_RE.finditer(path.read_text(encoding="utf-8")):
            url = match.group(0).rstrip(".,;:)")
            found.setdefault(url, []).append(path.name)
    return found


def probe_curl(url: str, timeout: int) -> int:
    """Fallback probe. Some hosts negotiate fine with curl but not with urllib
    (TLS/HTTP2 quirks), and a false 'dead' verdict is the worst outcome here."""
    try:
        result = subprocess.run(
            ["curl", "-sS", "-o", "/dev/null", "-w", "%{http_code}",
             "-L", "--max-time", str(timeout), "-A", UA, url],
            capture_output=True, text=True, timeout=timeout + 5,
        )
        return int(result.stdout.strip() or 0)
    except Exception:
        return 0


def probe(url: str, timeout: int) -> int:
    """Return an HTTP status code, or 0 if the request never completed."""
    ctx = ssl.create_default_context()
    request = urllib.request.Request(url, headers={"User-Agent": UA}, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=timeout, context=ctx) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code
    except Exception:
        return probe_curl(url, timeout)


def classify(url: str, status: int) -> str:
    if 200 <= status < 400:
        return "OK"
    if any(host in url for host in BOT_BLOCKING_HOSTS):
        return "BLOCKED"
    if status in (403, 429):
        # Could be rot, could be a new bot policy — worth a human look either way.
        return "BLOCKED"
    return "DEAD"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", type=pathlib.Path, help="markdown file or directory")
    parser.add_argument("--timeout", type=int, default=25)
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()

    if not args.target.exists():
        print(f"no such path: {args.target}", file=sys.stderr)
        return 2

    urls = collect_urls(args.target)
    if not urls:
        print("no URLs found")
        return 0

    print(f"checking {len(urls)} URLs...\n")
    results: list[tuple[str, str, int, list[str]]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(probe, url, args.timeout): url for url in urls}
        for future in concurrent.futures.as_completed(futures):
            url = futures[future]
            status = future.result()
            results.append((classify(url, status), url, status, urls[url]))

    order = {"DEAD": 0, "BLOCKED": 1, "OK": 2}
    results.sort(key=lambda row: (order[row[0]], row[1]))

    dead = [r for r in results if r[0] == "DEAD"]
    blocked = [r for r in results if r[0] == "BLOCKED"]

    for verdict, url, status, files in results:
        if verdict == "OK":
            continue
        print(f"{verdict:8} {status:>3}  {url}\n{'':13}in {', '.join(sorted(set(files)))}")

    print(
        f"\n{len(results) - len(dead) - len(blocked)} ok, "
        f"{len(blocked)} blocked (verify in a browser), {len(dead)} dead"
    )
    if dead:
        print(
            "\nRe-probe each DEAD entry on its own before removing it — a status of 0 "
            "in a parallel run is often rate limiting, not rot:\n"
            "  python3 -c \"import sys; sys.path.insert(0,'scripts'); "
            "from check_links import probe; print(probe('<url>', 25))\""
        )
    return 1 if dead else 0


if __name__ == "__main__":
    raise SystemExit(main())
