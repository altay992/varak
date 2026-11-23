"""Varak yerel sunucusu: Nöbet arayüzünü (web/dist) ve /api uçlarını aynı porttan sunar.

  python3 server/server.py              web modu: tarayıcıda açar
  python3 server/server.py --desktop    Electron kabuğu başlatır; anahtarlar stdin'den gelir

Yalnızca 127.0.0.1 üzerinde dinler. Başka sitelerin istek atmasını engellemek için
/api uçları X-Varak başlığı ve yerel Host ister.
"""
import argparse
import json
import mimetypes
import os
import sys
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "KitapCevirmeni"))
sys.path.insert(0, str(ROOT / "server"))

from cevirmen import CATALOG, ENV_KEYS, HOME_DIR, LANGS, PROMPT, TONES, Book  # noqa: E402
from arsiv import inventory  # noqa: E402
from runner import OUTPUT_DIR, Keys, Runner  # noqa: E402
from studio import open_native  # noqa: E402

DIST = ROOT / "web" / "dist"
UPLOADS = HOME_DIR / "Yüklenen kitaplar"
MAX_UPLOAD = 300 * 1024 * 1024
# cevirmen.settings() ile aynı sınırlar.
RANGES = {"limit": [500, 16000], "interval": [1, 100], "tries": [1, 5]}


class Api:
    def __init__(self, runner):
        self.runner = runner
        self.files = {}

    def meta(self, _):
        return {"catalog": CATALOG, "tones": list(TONES), "langs": LANGS, "prompt": PROMPT,
                "envKeys": ENV_KEYS, "ranges": RANGES}

    def state(self, _):
        return self.runner.state()

    def select(self, data):
        self.runner.select(data.get("path", ""))

    def save(self, data):
        self.runner.save(data.get("settings", {}))

    def key(self, data):
        """Web modunda anahtarı kaydeder; boş anahtar kaydı siler. Masaüstünde Electron kabuğu yapar."""
        self.runner.keys.set(data.get("provider", ""), data.get("key", ""))

    def switch_edition(self, data):
        self.runner.switch_edition(data.get("settings", {}))

    def start(self, _):
        self.runner.start()

    def pause(self, _):
        self.runner.pause()

    def page(self, data):
        return self.runner.page(data.get("index"))

    def open_word(self, _):
        self.runner.open_word()

    def open_folder(self, _):
        self.runner.open_folder()

    def archive(self, _):
        books, files = inventory(OUTPUT_DIR)
        self.files = {str(p.relative_to(OUTPUT_DIR)): p for p, *_ in files}
        return {
            "books": [dict(info, id=key, date=int(info["date"] * 1000)) for key, info in books.items()],
            "files": [{"id": str(p.relative_to(OUTPUT_DIR)), "name": p.name, "book": book, "project": project,
                       "edition": edition, "kind": "Okuma kopyası" if copy else "Çeviri", "size": size,
                       "date": int(stamp * 1000)}
                      for p, project, book, edition, copy, stamp, size in files],
        }

    def _file(self, data):
        path = self.files.get(data.get("id"))
        if not path or not path.is_file() or OUTPUT_DIR.resolve() not in path.resolve().parents:
            raise ValueError("Dosya bulunamadı. Listeyi yenileyin.")
        return path

    def preview(self, data):
        return "\n\n".join("".join(row) for row in Book(self._file(data)).rows)[:20000]

    def open_output(self, data):
        open_native(self._file(data))

    def reveal_output(self, data):
        open_native(self._file(data).parent)

    def upload(self, name, body):
        name = Path(name).name
        if not name.lower().endswith(".docx") or name.startswith("~$"):
            raise ValueError("Geçerli bir .docx dosyası seçin.")
        if self.runner.busy:
            raise ValueError("Önce çeviriyi duraklatın.")
        UPLOADS.mkdir(exist_ok=True)
        target = UPLOADS / name
        target.write_bytes(body)
        self.runner.select(target)


def handler_for(api, port):
    hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
    calls = {name.replace("_", "-"): getattr(api, name) for name in dir(api)
             if not name.startswith("_") and name not in ("runner", "files", "upload")}

    class Handler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *args):
            pass

        def send(self, code, body, kind="application/json; charset=utf-8", extra=None):
            self.send_response(code)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("X-Content-Type-Options", "nosniff")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)

        def reply(self, code, payload):
            self.send(code, json.dumps(payload, ensure_ascii=False).encode())

        def trusted(self):
            # DNS rebinding ve başka sitelerden gelen istekler: yerel Host ve özel başlık şart.
            return self.headers.get("Host") in hosts and self.headers.get("X-Varak") == "1"

        def do_GET(self):
            url = urlparse(self.path)
            if url.path.startswith("/api/"):
                return self.reply(405, {"error": "POST kullanın."})
            if self.headers.get("Host") not in hosts:
                return self.send(403, b"")
            relative = unquote(url.path).lstrip("/") or "index.html"
            path = (DIST / relative).resolve()
            if DIST.resolve() not in path.parents or not path.is_file():
                path = DIST / "index.html"
            if not path.is_file():
                return self.send(503, "Arayüz derlenmemiş. Önce: npm run build".encode(), "text/plain; charset=utf-8")
            kind = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
            cache = "no-cache" if path.name == "index.html" else "public, max-age=31536000, immutable"
            self.send(200, path.read_bytes(), kind, {"Cache-Control": cache})

        def do_POST(self):
            url = urlparse(self.path)
            if not url.path.startswith("/api/") or not self.trusted():
                return self.reply(403, {"error": "İzin verilmeyen istek."})
            name = url.path[len("/api/"):]
            length = int(self.headers.get("Content-Length") or 0)
            try:
                if name == "upload":
                    if length > MAX_UPLOAD:
                        raise ValueError("Dosya çok büyük.")
                    api.upload(unquote(self.headers.get("X-File-Name", "")), self.rfile.read(length))
                    return self.reply(200, {"value": None})
                body = self.rfile.read(length) if length else b"{}"
                call = calls.get(name)
                if not call:
                    raise ValueError("Bilinmeyen işlem.")
                data = json.loads(body or b"{}")
                self.reply(200, {"value": call(data if isinstance(data, dict) else {})})
            except Exception as e:  # Kullanıcıya gösterilecek Türkçe mesaj.
                self.reply(400, {"error": str(e) or e.__class__.__name__})

    return Handler


def read_keys(keys):
    """Masaüstü kabuğu anahtarları stdin'den satır satır JSON olarak verir; stdin kapanınca çıkılır."""
    for line in sys.stdin:
        try:
            for provider, key in json.loads(line).get("keys", {}).items():
                keys.set(provider, key)
        except (ValueError, AttributeError):
            pass
    os._exit(0)


def main():
    parser = argparse.ArgumentParser(description="Varak yerel sunucusu")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--desktop", action="store_true", help="Electron kabuğu için")
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    keys = Keys(persist=not args.desktop)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), None)
    port = server.server_address[1]
    server.RequestHandlerClass = handler_for(Api(Runner(keys)), port)
    server.daemon_threads = True
    url = f"http://127.0.0.1:{port}/"
    if args.desktop:
        print(json.dumps({"port": port}), flush=True)
        threading.Thread(target=read_keys, args=(keys,), daemon=True).start()
    else:
        print(f"Varak açık: {url}  (kapatmak için Ctrl+C)", flush=True)
        if not args.no_browser:
            threading.Timer(0.4, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
