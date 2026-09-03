"""Local dev server for Cocoa & Crumb.

Plain `python -m http.server` sends no Cache-Control, so browsers cache CSS and
JS aggressively and you end up staring at a stale page wondering why an edit
did nothing. This is the same static server with caching turned off.

    python devserver.py [port]

Production is GitHub Pages / Cloudflare Pages, which serve these files with
their own sensible caching. This script is only for local work.
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # keep the console readable: only report problems
        status = args[1] if len(args) > 1 else ""
        if str(status).startswith(("4", "5")):
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    handler = partial(NoCacheHandler, directory=".")
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print("Cocoa & Crumb dev server: http://localhost:%d  (no-cache)" % port)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
