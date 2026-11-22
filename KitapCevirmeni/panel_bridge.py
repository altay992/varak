"""Line-delimited JSON bridge between the desktop window and the Word worker."""
import json
import os
import sys
import threading
import time
from datetime import datetime
from pathlib import Path

from cevirmen import HOME_DIR, LANGS, PROMPT, Book, inspect_book
from arsiv import inventory
from studio import Session, open_native


class Bridge:
    def __init__(self):
        self.session = Session()
        self.base = HOME_DIR / "Kitap Çıktısı"
        self.path = None
        self.total = self.ready = self.ticket = 0
        self.planning = False
        self.error = ""
        self.in_run = False
        self.files = {}

    def inspect(self):
        self.ticket += 1
        ticket, path, cfg = self.ticket, self.path, self.session.cfg.copy()
        self.total = self.ready = 0
        self.error = ""
        self.in_run = False
        self.planning = bool(path)
        if not path:
            return
        def work():
            try:
                total, ready = inspect_book(path,cfg)
                error = ""
            except Exception as e:
                total = ready = 0
                error = str(e)
            with self.session.lock:
                if ticket == self.ticket:
                    self.total,self.ready,self.error,self.planning=total,ready,error,False
        threading.Thread(target=work,daemon=True).start()

    def handle(self,name,data):
        if name in ("select","save"):
            with self.session.lock:
                if self.session.state["busy"]:
                    raise ValueError("Önce çeviriyi duraklatın.")
                if name=="select":
                    self.path=Path(data["path"]).resolve()
                else:
                    self.session.action("save",data)
                self.inspect()
            return {}
        if name=="start":
            if not self.path or self.planning or not self.total:
                raise ValueError("Önce bir Word kitabı seçin ve parça sayısının hesaplanmasını bekleyin.")
            if self.in_run:
                # The previous run may have produced new checkpoints.
                self.total,self.ready=inspect_book(self.path,self.session.cfg)
            self.session.action("start",{"path":str(self.path),"key":data.get("key",""),"model":data.get("model",self.session.cfg["model"])})
            self.in_run=True
            return {}
        if name=="state":
            with self.session.lock:
                s=self.session.action("state",{})
                if not self.in_run:
                    s.update(phase="Hazırlanıyor" if self.planning else "Hazır",done=self.ready,
                             total=self.total,message="",error=self.error,word="",pages=0,samples=0,fresh=0)
                total=s["total"] or self.total
                remaining=max(0,total-self.ready-s["fresh"])
                pace=s["seconds"]/s["samples"] if s["samples"] else 20
                seconds=pace*remaining
                if s["busy"] and remaining and s.get("batch_start"):
                    seconds=max(1,seconds-min(pace,time.monotonic()-s["batch_start"]))
                s.update(total=total,book=self.path.name if self.path else "",planning=self.planning,
                         eta=round(seconds),measured=bool(s["samples"]),langs=list(LANGS),defaultPrompt=PROMPT,
                         envKey=bool(os.getenv("OPENAI_API_KEY")),stopping=s["busy"] and self.session.stop.is_set())
                return s
        if name=="archive":
            books,files=inventory(self.base)
            self.files={str(p.relative_to(self.base)):p for p,*_ in files}
            return {"books":[dict(info,id=k) for k,info in books.items()],
                    "files":[dict(id=str(p.relative_to(self.base)),name=p.name,book=book,project=project,
                                  edition=edition,kind="Okuma kopyası" if copy else "Çeviri",size=size,
                                  date=datetime.fromtimestamp(stamp).strftime("%d.%m.%Y %H:%M"))
                             for p,project,book,edition,copy,stamp,size in files]}
        if name in ("preview","open_output","output_folder"):
            p=self.files.get(data.get("id"))
            if not p or not p.is_file() or self.base.resolve() not in p.resolve().parents:
                raise ValueError("Dosya bulunamadı. Listeyi yenileyin.")
            if name=="preview":
                return "\n\n".join("".join(row) for row in Book(p).rows)[:20000]
            open_native(p if name=="open_output" else p.parent)
            return {}
        if name in ("page","pause","word","folder"):
            return self.session.action(name,data)
        raise ValueError("Bilinmeyen işlem.")


if __name__=="__main__":
    bridge=Bridge()
    for line in sys.stdin:
        request={}
        try:
            request=json.loads(line)
            response={"value":bridge.handle(request["name"],request.get("data",{}))}
        except Exception as err:
            response={"error":str(err)}
        print(json.dumps(dict(response,id=request.get("id")),ensure_ascii=False),flush=True)
