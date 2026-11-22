"""Local-only desktop interface; all app assets ship with the package."""
import json
import os
import secrets
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

from cevirmen import DEFAULT, HOME_DIR, MODELS, TONES, atomic, process, settings

def open_native(path):
    if os.name == "nt":
        os.startfile(str(path))
    else:
        subprocess.Popen(["open" if sys.platform == "darwin" else "xdg-open", str(path)])

class Session:
    def __init__(self):
        self.lock = threading.RLock()
        self.stop = threading.Event()
        self.file = HOME_DIR / "ayarlar.json"
        try:
            self.cfg = settings(json.loads(self.file.read_text("utf-8")))
        except (OSError, ValueError, TypeError, AttributeError):
            self.cfg = DEFAULT.copy()
        self.pages = []
        self.state = dict(source="", busy=False, done=0,total=0,phase="Hazır",message="",
                          word="",run=0,error="",samples=0,seconds=0,fresh=0)
    def work(self, source, key, cfg):
        def status(done,total,msg):
            with self.lock:
                self.state.update(done=done,total=total,message=msg,
                                  batch_start=time.monotonic() if msg.endswith("çevriliyor") else None)
        def notify(kind,data):
            with self.lock:
                if kind == "page":
                    self.pages.append(data)
                elif kind == "timing":
                    self.state["fresh"] += 1
                    if data is not None:
                        self.state["samples"] += 1
                        self.state["seconds"] += data
                else:
                    self.state["word"] = data
        try:
            complete,output=process(source,key,self.stop,status,options=cfg,notify=notify)
            with self.lock:
                self.state.update(phase="Tamamlandı" if complete else "Duraklatıldı",message=output.name)
        except Exception as e:
            with self.lock:
                self.state.update(phase="İşlem durdu",error=str(e))
        finally:
            with self.lock:
                self.state["busy"]=False

    def action(self, name, data):
        with self.lock:
            if name=="state":
                return dict(self.state, pages=len(self.pages),cfg=self.cfg,models=MODELS,tones=list(TONES))
            if name=="page":
                n=data.get("index",0)
                return self.pages[n] if type(n) is int and 0<=n<len(self.pages) else {"source":"","tr":""}
            if name=="folder":
                path=HOME_DIR/"Kitap Çıktısı"
                path.mkdir(exist_ok=True)
                open_native(path)
                return {}
            if name=="word":
                if not self.state["word"]: raise ValueError("İlk Word çıktısı henüz hazırlanmadı.")
                path=Path(self.state["word"])
                # Open a reading copy so Word never locks the file being refreshed.
                copies=path.parent/"Okuma kopyaları"
                copies.mkdir(exist_ok=True)
                snap=copies/(path.stem+" - "+secrets.token_hex(3)+".docx")
                with atomic(snap) as tmp: shutil.copyfile(path,tmp)
                open_native(snap)
                return {}
            if name=="pause":
                self.stop.set()
                return {}
            if self.state["busy"]: raise ValueError("Önce çeviriyi duraklatın.")
            if name=="save":
                cfg=settings(data)
                with atomic(self.file) as temp: temp.write_text(json.dumps(cfg,ensure_ascii=False),"utf-8")
                self.cfg=cfg
            elif name=="start":
                source=Path(data.get("path","").strip().strip('"')).expanduser()
                key=data.get("key","").strip() or os.getenv("OPENAI_API_KEY","")
                if not source.is_file() or source.suffix.lower()!=".docx": raise ValueError("Geçerli bir .docx dosyası seçin.")
                if not key: raise ValueError("OpenAI API anahtarınızı girin.")
                self.stop.clear()
                self.pages.clear()
                self.state.update(source=str(source.resolve()),busy=True,done=0,total=0,error="",word="",samples=0,seconds=0,fresh=0,batch_start=None,
                                  run=self.state["run"]+1,phase="Çevriliyor",message="Kitap ve kayıtlar okunuyor…")
                threading.Thread(target=self.work,args=(source.resolve(),key,self.cfg.copy()),daemon=True).start()
            else: raise ValueError("Bilinmeyen işlem.")
            return {}


from desktop_start import launch
