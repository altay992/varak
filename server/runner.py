"""Çeviri oturumu: motoru (KitapCevirmeni/cevirmen.py) çalıştırır ve arayüzün okuduğu durumu tutar.

Motora dokunmaz; yalnızca process() ve dışa açık yardımcılarını kullanır. Böylece
KitapCevirmeni klasörü üst depodan geldiği gibi güncellenebilir.
"""
import json
import os
import re
import secrets
import shutil
import threading
import time
from pathlib import Path

from cevirmen import (CATALOG, DEFAULT, ENV_KEYS, HOME_DIR, Book, atomic, cached, part_name,
                      process, project_paths, provider_for, settings)
from studio import open_native

OUTPUT_DIR = HOME_DIR / "Kitap Çıktısı"
SETTINGS_FILE = HOME_DIR / "ayarlar.json"
# Bu ayarlar sürüm klasörünü belirler; değişirlerse ayrı bir çeviri başlar.
EDITION_KEYS = ("model", "limit", "tone", "source_lang", "target_lang", "system_prompt")
DEFAULT_PACE = 20  # İlk istek ölçülene kadar parça başına varsayılan saniye.


def now_ms():
    return int(time.time() * 1000)


def structure_of(book):
    dom = book.parts.get("word/document.xml")
    if dom is None:
        return None
    headings = 0
    for node in dom.getElementsByTagNameNS("*", "pStyle"):
        value = next((a.value for a in node.attributes.values() if a.localName == "val"), "")
        if re.fullmatch(r"(heading|başlık|title|konubaşlığı)\s*\d*", value, re.I):
            headings += 1
    import zipfile
    with zipfile.ZipFile(book.path) as archive:
        images = sum(n.startswith("word/media/") for n in archive.namelist())
    return {"headings": headings, "tables": len(dom.getElementsByTagNameNS("*", "tbl")), "images": images}


def inspect(source, cfg):
    """Kitabı parçalara böler ve hangi parçaların kayıtta hazır olduğunu bulur."""
    _, legacy, title, folder, profile, edition = project_paths(source, cfg)
    book = Book(source, cfg["limit"])
    batches = list(book.batches())
    if not batches:
        raise ValueError("Çevrilebilir Word metni bulunamadı.")
    # Motorun eski (1.x) kayıtları içeri alma kuralı: yalnızca varsayılan profil.
    default_profile = profile == [DEFAULT["model"], DEFAULT["limit"], DEFAULT["tone"]]
    kept, texts = [], []
    for number, (a, b) in enumerate(batches):
        rows = book.rows[a:b]
        name = part_name(number, cfg["model"], rows)
        kept.append(cached(edition / "parcalar" / name, rows, cfg["target_lang"]) is not None or (
            default_profile and cached(legacy / "parcalar" / name, rows, cfg["target_lang"]) is not None))
        texts.append("\n\n".join("".join(r) for r in rows))
    return {"title": title, "kept": kept, "texts": texts, "structure": structure_of(book),
            "folder": folder, "edition": edition.name}


def editions_of(folder, current):
    out = []
    if folder and folder.is_dir():
        for path in sorted(folder.iterdir()):
            parts = path / "parcalar"
            if parts.is_dir():
                out.append({"name": path.name, "saved": sum(1 for _ in parts.glob("*.json")),
                            "current": path.name == current})
    return out


class Keys:
    """API anahtarları. Web modunda kullanıcı klasöründe (0600) dosyada, masaüstünde
    yalnızca bellekte tutulur; masaüstü kabuğu onları şifreli saklayıp stdin'den verir."""

    def __init__(self, persist):
        self.file = Path.home() / ".varak" / "anahtarlar.json" if persist else None
        self.values = {}
        if self.file:
            try:
                self.values = {k: v for k, v in json.loads(self.file.read_text("utf-8")).items() if k in CATALOG}
            except (OSError, ValueError, AttributeError):
                pass

    def set(self, provider, key):
        if provider not in CATALOG:
            raise ValueError("Bilinmeyen sağlayıcı.")
        key = (key or "").strip()
        if key:
            self.values[provider] = key
        else:  # Boş anahtar kaydı siler.
            self.values.pop(provider, None)
        if self.file:
            self.file.parent.mkdir(mode=0o700, exist_ok=True)
            with atomic(self.file) as temp:
                temp.write_text(json.dumps(self.values), "utf-8")
                os.chmod(temp, 0o600)

    def get(self, provider):
        return self.values.get(provider) or os.getenv(ENV_KEYS[provider], "")

    def status(self):
        return {p: {"saved": bool(self.values.get(p)), "environment": bool(os.getenv(ENV_KEYS[p]))} for p in CATALOG}


class Runner:
    def __init__(self, keys):
        self.keys = keys
        self.lock = threading.RLock()
        self.stop = threading.Event()
        try:
            self.cfg = settings(json.loads(SETTINGS_FILE.read_text("utf-8")))
        except (OSError, ValueError, TypeError, AttributeError):
            self.cfg = DEFAULT.copy()
        self.path = None
        self.ticket = 0
        self.info = None          # inspect() sonucu
        self.planning = False
        self.stale = False        # Son incelemeden sonra çeviri yapıldı mı
        self.error = ""
        self.busy = False
        self.phase = "Hazır"
        self.run = 0
        self.segments = []
        self.steps = []
        self.pages = []
        self.timings = []
        self.word = ""
        self.current = -1
        self.current_since = 0
        self.started_at = 0
        self.editions = []

    # ---- kitap seçimi ve inceleme -------------------------------------------------

    def select(self, path):
        path = Path(str(path).strip().strip('"')).expanduser()
        if not path.is_file() or path.suffix.lower() != ".docx":
            raise ValueError("Geçerli bir .docx dosyası seçin.")
        with self.lock:
            if self.busy:
                raise ValueError("Önce çeviriyi duraklatın.")
            self.path = path.resolve()
            self.start_inspection()

    def start_inspection(self):
        with self.lock:
            self.ticket += 1
            ticket, path, cfg = self.ticket, self.path, self.cfg.copy()
            self.info, self.segments, self.steps, self.pages, self.word = None, [], [], [], ""
            self.error, self.editions, self.phase, self.stale = "", [], "Hazır", False
            self.planning = bool(path)
        if path:
            threading.Thread(target=self._inspect, args=(ticket, path, cfg), daemon=True).start()

    def _inspect(self, ticket, path, cfg):
        try:
            info, error = inspect(path, cfg), ""
        except Exception as e:  # Bozuk dosya vb.: arayüzde gösterilir.
            info, error = None, str(e)
        with self.lock:
            if ticket != self.ticket:
                return
            self.info, self.error, self.planning = info, error, False
            if info:
                self.segments = ["kept" if k else "todo" for k in info["kept"]]
                self.editions = editions_of(info["folder"], info["edition"])

    # ---- ayarlar ------------------------------------------------------------------

    def save(self, data):
        cfg = settings(data)
        with self.lock:
            if self.busy and any(cfg[k] != self.cfg[k] for k in EDITION_KEYS):
                raise ValueError("Bu değişiklik yeni bir sürüm açar. Önce çeviriyi duraklatın.")
            with atomic(SETTINGS_FILE) as temp:
                temp.write_text(json.dumps(cfg, ensure_ascii=False), "utf-8")
            changed = any(cfg[k] != self.cfg[k] for k in EDITION_KEYS)
            self.cfg = cfg
            if changed and not self.busy:
                self.start_inspection()

    def switch_edition(self, data):
        """Çeviriyi duraklatır, yeni sürüm ayarlarını kaydeder ve yeni sürümü başlatır."""
        settings(data)  # Geçersizse hemen söyle.

        def work():
            try:
                self.pause()
                while self.busy:
                    time.sleep(0.2)
                self.save(data)
                while self.planning:
                    time.sleep(0.1)
                self.start()
            except Exception as e:
                with self.lock:
                    self.error = str(e)
        threading.Thread(target=work, daemon=True).start()

    # ---- çeviri -------------------------------------------------------------------

    def start(self):
        with self.lock:
            if self.busy:
                return
            if not self.path or self.planning or not self.info:
                raise ValueError("Önce bir Word kitabı seçin ve parça sayısının hesaplanmasını bekleyin.")
            provider = provider_for(self.cfg["model"])
            key = self.keys.get(provider)
            if not key:
                raise ValueError(f"{provider} API anahtarınızı girin.")
            self.stop.clear()
            self.busy, self.phase, self.error = True, "Çevriliyor", ""
            self.run += 1
            self.steps, self.pages, self.timings, self.word = [], [], [], ""
            self.current, self.started_at = -1, now_ms()
            stale, path, cfg = self.stale, self.path, self.cfg.copy()
        threading.Thread(target=self._work, args=(path, key, cfg, stale), daemon=True).start()

    def _work(self, path, key, cfg, stale):
        try:
            if stale:  # Önceki çeviri yeni kayıtlar bıraktı; hazır parçaları yeniden say.
                with self.lock:
                    self.planning = True
                info = inspect(path, cfg)
                with self.lock:
                    self.info, self.planning = info, False
                    self.segments = ["kept" if k else "todo" for k in info["kept"]]
            with self.lock:
                kept = self.info["kept"]
                resume = kept.index(False) if False in kept else len(kept)
                self.steps.append({"kind": "read", "at": now_ms(), "total": len(kept),
                                   "kept": sum(kept), "resumeFrom": resume})
            fresh = {"seconds": None, "used": False}

            def status(done, total, message):
                with self.lock:
                    if message.endswith("çevriliyor"):
                        self.current, self.current_since = done, now_ms()

            def notify(kind, data):
                with self.lock:
                    if kind == "timing":
                        fresh.update(used=True, seconds=data)
                        if data is not None:
                            self.timings.append(data)
                    elif kind == "page":
                        n, at = len(self.pages), now_ms()
                        seconds = fresh["seconds"] if fresh["used"] else None
                        if fresh["used"]:
                            self.steps.append({"kind": "chunk", "at": at, "n": n, "seconds": seconds, "retries": 0})
                        if n < len(self.segments):
                            self.segments[n] = "done" if fresh["used"] else "kept"
                        self.pages.append({"n": n, "source": data["source"], "target": data["tr"],
                                           "at": at, "seconds": seconds})
                        self.current = -1
                        fresh.update(used=False, seconds=None)
                    elif kind == "word":
                        self.word = data
                        try:
                            size = Path(data).stat().st_size
                        except OSError:
                            size = 0
                        name = Path(data).name
                        expected = f"{self.info['title']} - {cfg['target_lang']}.docx"
                        self.steps.append({"kind": "word", "at": now_ms(), "path": data, "name": name,
                                           "size": size, "upTo": len(self.pages), "renamed": name != expected})
                        if not any(e["current"] for e in self.editions):  # Yeni sürüm klasörü yeni açıldı.
                            self.editions = editions_of(self.info["folder"], self.info["edition"])

            complete, output = process(path, key, self.stop, status, options=cfg, notify=notify)
            with self.lock:
                self.word = str(output) if output.exists() else self.word
                self.phase = "Tamamlandı" if complete else "Duraklatıldı"
                total = len(self.segments)
                if complete:
                    self.steps.append({"kind": "complete", "at": now_ms(), "total": total,
                                       "seconds": (now_ms() - self.started_at) / 1000})
                else:
                    self.steps.append({"kind": "paused", "at": now_ms(), "done": self.done(), "total": total})
        except Exception as e:
            with self.lock:
                self.phase, self.error = "İşlem durdu", str(e)
                self.steps.append({"kind": "error", "at": now_ms(), "message": str(e), "done": self.done()})
        finally:
            with self.lock:
                self.busy, self.current, self.stale = False, -1, True
                if self.info:
                    self.editions = editions_of(self.info["folder"], self.info["edition"])

    def pause(self):
        self.stop.set()

    def done(self):
        return sum(s != "todo" for s in self.segments)

    # ---- okuma ve dosyalar ----------------------------------------------------------

    def page(self, index):
        with self.lock:
            return self.pages[index] if isinstance(index, int) and 0 <= index < len(self.pages) else None

    def open_word(self):
        with self.lock:
            word = self.word
        if not word or not Path(word).is_file():
            raise ValueError("İlk Word çıktısı henüz hazırlanmadı.")
        path = Path(word)
        # Word dosyayı kilitlemesin diye güncellenen belgenin bir okuma kopyası açılır.
        copies = path.parent / "Okuma kopyaları"
        copies.mkdir(exist_ok=True)
        snap = copies / (path.stem + " - " + secrets.token_hex(3) + ".docx")
        with atomic(snap) as temp:
            shutil.copyfile(path, temp)
        open_native(snap)

    def open_folder(self):
        OUTPUT_DIR.mkdir(exist_ok=True)
        open_native(OUTPUT_DIR)

    # ---- durum ------------------------------------------------------------------------

    def state(self):
        with self.lock:
            total = len(self.segments)
            done = self.done()
            remaining = total - done
            pace = sum(self.timings) / len(self.timings) if self.timings else DEFAULT_PACE
            eta = pace * remaining
            if self.busy and remaining and self.current >= 0:
                eta = max(1, eta - min(pace, (now_ms() - self.current_since) / 1000))
            seam = None
            if self.pages:
                last = self.pages[-1]
                texts = self.info["texts"] if self.info else []
                nxt = texts[last["n"] + 1][:420] if last["n"] + 1 < len(texts) else ""
                seam = {"n": last["n"], "tail": last["target"][-420:], "next": nxt}
            return {
                "book": self.path.name if self.path else "",
                "title": self.info["title"] if self.info else (self.path.stem if self.path else ""),
                "phase": "Hazırlanıyor" if self.planning and not self.busy else self.phase,
                "busy": self.busy, "stopping": self.busy and self.stop.is_set(), "planning": self.planning,
                "done": done, "total": total, "error": self.error, "word": self.word, "run": self.run,
                "pages": len(self.pages), "segments": self.segments, "current": self.current,
                "currentSince": self.current_since, "steps": self.steps, "startedAt": self.started_at,
                "average": sum(self.timings) / len(self.timings) if self.timings else 0,
                "eta": round(eta), "measured": bool(self.timings),
                "structure": self.info["structure"] if self.info else None,
                "editions": self.editions, "seam": seam, "cfg": self.cfg,
                "keys": self.keys.status(), "outputDir": str(OUTPUT_DIR),
            }
