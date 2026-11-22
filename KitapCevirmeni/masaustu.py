"""Varak's native desktop workspace."""
import math
import os
import queue
import threading
import time
from datetime import datetime, timedelta
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

from cevirmen import LANGS, MODELS, TONES, inspect_book

CANVAS, SURFACE, HEADER = "#090a0d", "#17191e", "#0e1014"
TEXT, SECONDARY, BORDER = "#f2f4f8", "#bdc3cf", "#373c47"
ACCENT, CONTROL, FIELD = "#86ddcc", "#303640", "#101216"


def enable_native_dpi():
    """Set DPI awareness before Windows creates the first Tk window."""
    if os.name != "nt":
        return
    import ctypes
    try:
        set_context = ctypes.windll.user32.SetProcessDpiAwarenessContext
        set_context.argtypes = [ctypes.c_void_p]
        if set_context(ctypes.c_void_p(-4)):  # per-monitor aware v2
            return
    except (AttributeError, OSError):
        pass
    try:
        if ctypes.windll.shcore.SetProcessDpiAwareness(2) == 0:
            return
    except (AttributeError, OSError):
        pass
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except (AttributeError, OSError):
        pass


def duration(seconds):
    if seconds <= 0:
        return "0 dk"
    minutes = math.ceil(seconds/60)
    if minutes < 60:
        return f"≈ {minutes} dk"
    return f"≈ {minutes//60} sa {minutes%60} dk"

def finish(seconds):
    now = datetime.now()
    end = now + timedelta(seconds=seconds)
    return end.strftime("%H:%M" if end.date()==now.date() else "%d.%m %H:%M")

def desktop(session):
    enable_native_dpi()
    root = tk.Tk()
    root.title("Varak 2.2 · Kitap Çevirmeni")
    scale = max(1.0, root.winfo_fpixels("1i") / 96)
    screen_w, screen_h = root.winfo_screenwidth(), root.winfo_screenheight()
    width = min(round(1100 * scale), screen_w - 20)
    height = min(round(740 * scale), screen_h - round(72 * scale))
    root.geometry(f"{width}x{height}")
    root.minsize(min(width, round(740*scale)), min(height, round(580*scale)))
    root.configure(bg=CANVAS)
    root.option_add("*Font", "{Segoe UI} 10")
    for name, value in (("background", FIELD), ("foreground", TEXT),
                        ("selectBackground", ACCENT), ("selectForeground", HEADER)):
        root.option_add("*TCombobox*Listbox."+name,value)
    style=ttk.Style(root)
    style.theme_use("clam")
    style.configure(".",font=("Segoe UI",10),background=SURFACE,foreground=TEXT,
                    bordercolor=BORDER,lightcolor=BORDER,darkcolor=BORDER,
                    selectbackground=ACCENT,selectforeground=HEADER)
    for name in ("TEntry","TCombobox"):
        style.configure(name,padding=5,fieldbackground=FIELD,foreground=TEXT,
                        background=CONTROL,arrowcolor=TEXT,insertcolor=TEXT)
        style.map(name,fieldbackground=[("readonly",FIELD),("disabled",SURFACE)],
                  foreground=[("readonly",TEXT)],bordercolor=[("focus",ACCENT)])
    style.configure("TCheckbutton",background=SURFACE,foreground=SECONDARY,
                    indicatorbackground=FIELD,indicatorforeground=HEADER)
    style.map("TCheckbutton",background=[("active",SURFACE)],foreground=[("active",TEXT)],
              indicatorbackground=[("selected",ACCENT),("!selected",FIELD)])
    style.configure("Vertical.TScrollbar",troughcolor=FIELD,background=CONTROL,arrowcolor=TEXT)
    style.configure("Varak.Horizontal.TProgressbar",thickness=7,troughcolor=FIELD,
                    background=ACCENT,borderwidth=0,lightcolor=ACCENT,darkcolor=ACCENT)
    def panel(parent,bg=SURFACE,**kw):
        return tk.Frame(parent,bg=bg,**kw)
    def label(parent,text="",size=10,color=TEXT,bold=False,serif=False,**kw):
        return tk.Label(parent,text=text,anchor="w",justify="left",borderwidth=0,
                        bg=parent["bg"],fg=color,font=("Cambria" if serif else "Segoe UI",size,"bold" if bold else "normal"),**kw)
    def button(parent,text,fn,mode="soft"):
        bg,fg={"soft":(CONTROL,TEXT),"main":(ACCENT,HEADER),"dark":("#242830",TEXT)}[mode]
        return tk.Button(parent,text=text,command=fn,bg=bg,fg=fg,relief="flat",bd=0,padx=12,pady=6,
                         activebackground=ACCENT,activeforeground=SURFACE,disabledforeground="#9299a6",
                         cursor="hand2",font=("Segoe UI",10,"bold"),highlightthickness=1,highlightbackground=bg,highlightcolor=ACCENT)
    def boxed(parent):
        return panel(parent,highlightbackground=BORDER,highlightthickness=1,padx=15,pady=12)
    def alert(fn):
        try: return fn()
        except Exception as e: messagebox.showerror("Varak",str(e),parent=root)
    cfg=session.cfg.copy()
    source=tk.StringVar()
    key=tk.StringVar(value=os.getenv("OPENAI_API_KEY",""))
    heading=tk.StringVar()
    phase=tk.StringVar(value="Hazır")
    note=tk.StringVar(value="Kitap seçildiğinde parça sayısı ve ilk süre tahmini hesaplanır.")
    totalv,remainv,endv=[tk.StringVar(value="—") for _ in range(3)]
    status=tk.StringVar(value="Kitap seçimi bekleniyor.")
    language=tk.StringVar(value=cfg["target_lang"])
    follow=tk.BooleanVar(value=True)
    jump=tk.StringVar(value="")
    bus=queue.Queue()
    generation=0
    plan=None
    running=False
    started=False
    closing=False
    lastpage=None
    pagecount=0
    dialog=None

    header=panel(root,HEADER,padx=20,pady=10)
    header.pack(fill="x")
    label(header,"Varak",24,ACCENT,serif=True).pack(side="left",padx=(0,17))
    label(header,"Çeviri masası",12,TEXT,bold=True).pack(side="left")
    settings_btn=button(header,"Ayarlar",lambda:settings_window(),"dark")
    settings_btn.pack(side="right")
    button(header,"Kitap Çıktısı",lambda:alert(lambda:session.action("folder",{})),"dark").pack(side="right",padx=8)
    body=panel(root,CANVAS,padx=18,pady=10)
    body.pack(fill="both",expand=True)
    strip=panel(body,CANVAS)
    strip.pack(fill="x",pady=(0,8))
    label(strip,textvariable=heading,bold=True,color=ACCENT).pack(side="left")
    label(strip,textvariable=phase,color=SECONDARY).pack(side="right")
    stats=panel(body,CANVAS)
    stats.pack(fill="x")
    for i,(name,value) in enumerate([("Toplam parça",totalv),("Tahmini kalan süre",remainv),("Tahmini bitiş",endv)]):
        stats.columnconfigure(i,weight=1,uniform="metric")
        card=panel(stats,SURFACE,padx=13,pady=5,highlightbackground=BORDER,highlightthickness=1)
        card.grid(row=0,column=i,sticky="ew",padx=(0,6 if i<2 else 0))
        label(card,name,9,SECONDARY).pack(anchor="w")
        label(card,textvariable=value,size=19,color=TEXT,bold=True).pack(anchor="w")
    label(body,textvariable=note,size=10,color=SECONDARY).pack(fill="x",pady=(3,8))
    area=panel(body,CANVAS)
    area.pack(fill="both",expand=True)
    area.rowconfigure(0,weight=1)
    area.columnconfigure(1,weight=1)
    left=boxed(area)
    left.grid(row=0,column=0,sticky="ns",padx=(0,9))
    right=boxed(area)
    right.grid(row=0,column=1,sticky="nsew")
    label(left,"Kitap ve bağlantı",15,bold=True).pack(anchor="w")
    label(left,"Word dosyası",bold=True).pack(anchor="w",pady=(10,3))
    filefield=ttk.Entry(left,textvariable=source,width=29,state="readonly")
    filefield.pack(fill="x")
    def choose():
        path=filedialog.askopenfilename(parent=root,filetypes=[("Word kitabı","*.docx")])
        if path:
            source.set(path)
            filefield.xview_moveto(1)
            prepare()
    pick=button(left,"Dosya seç…",choose)
    pick.pack(anchor="w",pady=(4,6))
    label(left,"OpenAI API anahtarı",bold=True).pack(anchor="w")
    token=ttk.Entry(left,textvariable=key,show="•",width=29)
    token.pack(fill="x",pady=(3,1))
    def toggle():
        token.configure(show="" if show.get() else "•")
    show=tk.BooleanVar()
    ttk.Checkbutton(left,text="Anahtarı göster",variable=show,command=toggle).pack(anchor="w")
    label(left,"Kitap metni çeviri için OpenAI’ye gönderilir.",size=10,color=SECONDARY,wraplength=230).pack(anchor="w",pady=(4,9))
    go=button(left,"Başlat / Devam et",lambda:alert(start),"main")
    go.pack(fill="x")
    pause=button(left,"Duraklat",lambda:session.action("pause",{}))
    pause.pack(fill="x",pady=(4,5))
    bar=ttk.Progressbar(left,style="Varak.Horizontal.TProgressbar")
    bar.pack(fill="x",pady=(5,4))
    label(left,textvariable=status,size=10,color=SECONDARY,wraplength=225).pack(fill="x")

    rtop=panel(right)
    rtop.pack(fill="x")
    label(rtop,"Canlı okuma",16,bold=True).pack(side="left")
    word=button(rtop,"Word’de aç",lambda:alert(lambda:session.action("word",{})))
    word.pack(side="right")
    tools=panel(right)
    tools.pack(fill="x",pady=(6,5))
    langs=ttk.Combobox(tools,textvariable=language,state="readonly",width=13)
    langs.pack(side="left")
    ttk.Checkbutton(tools,text="Son parçayı izle",variable=follow).pack(side="right")
    reader=panel(right)
    reader.pack(fill="both",expand=True)
    content=tk.Text(reader,wrap="word",bg=SURFACE,fg=TEXT,font=("Segoe UI",12),borderwidth=0,
                    padx=5,pady=8,spacing3=5,height=4,width=24,highlightthickness=0,selectbackground=ACCENT,selectforeground=HEADER,insertbackground=TEXT)
    scroll=ttk.Scrollbar(reader,command=content.yview)
    content.configure(yscrollcommand=scroll.set)
    scroll.pack(side="right",fill="y")
    content.pack(fill="both",expand=True)
    bottom=panel(right)
    bottom.pack(fill="x",pady=(6,0))
    label(bottom,"Parça",size=10,color=SECONDARY).pack(side="left")
    numbers=ttk.Combobox(bottom,textvariable=jump,state="readonly",width=7)
    numbers.pack(side="left",padx=5)
    numbers.bind("<<ComboboxSelected>>",lambda _:follow.set(False))
    def move(d):
        if pagecount:
            follow.set(False)
            jump.set(str(max(1,min(pagecount,int(jump.get() or 1)+d))))
    button(bottom,"›",lambda:move(1)).pack(side="right")
    button(bottom,"‹",lambda:move(-1)).pack(side="right",padx=5)

    def prepare():
        nonlocal generation,plan,started,pagecount
        generation+=1
        ticket=generation
        plan=None
        started=False
        pagecount=0
        jump.set("")
        numbers.configure(values=())
        phase.set("Hazırlanıyor")
        status.set("Word metni ve kayıtlı parçalar okunuyor…")
        opts=cfg.copy()
        path=Path(source.get())
        def inspect():
            try: bus.put((ticket,inspect_book(path,opts),None))
            except Exception as e: bus.put((ticket,None,str(e)))
        threading.Thread(target=inspect,daemon=True).start()
    def start():
        nonlocal started,running
        if not plan: return
        session.action("start",{"path":source.get(),"key":key.get()})
        started=running=True
        follow.set(True)
        jump.set("")
    def settings_window():
        nonlocal dialog
        if running: return
        if dialog and dialog.winfo_exists():
            dialog.lift()
            return
        dialog=tk.Toplevel(root)
        dialog.title("Varak · Çeviri ayarları")
        dialog.transient(root)
        dialog.grab_set()
        pane=panel(dialog,CANVAS,padx=20,pady=14)
        pane.pack(fill="both",expand=True)
        label(pane,"Çeviri ayarları",20,serif=True).grid(row=0,column=0,columnspan=2,sticky="w",pady=(0,8))
        fields={}
        for i,(k,name,values) in enumerate([
            ("source_lang","Kaynak dil",list(LANGS)),("target_lang","Hedef dil",list(LANGS)),
            ("model","API modeli",MODELS),("tone","Üslup",list(TONES)),
            ("limit","Parça boyutu (500–16.000 karakter)",None),("tries","Bağlantı denemesi (1–5)",None),
            ("interval","Word güncelleme aralığı (1–100 parça)",None)]):
            label(pane,name).grid(row=i+1,column=0,pady=5,padx=(0,15),sticky="w")
            fields[k]=tk.StringVar(value=cfg[k])
            widget=(ttk.Combobox(pane,values=values,textvariable=fields[k],state="readonly",width=18)
                    if values else ttk.Entry(pane,textvariable=fields[k],width=20))
            widget.grid(row=i+1,column=1,sticky="ew")
        label(pane,"Dil, model, üslup veya boyut değişince ayrı bir çeviri sürümü açılır.",size=10,color=SECONDARY,
              wraplength=400).grid(row=8,column=0,columnspan=2,sticky="w",pady=7)
        def save():
            data={k:v.get() for k,v in fields.items()}
            try:
                for k in ("limit","tries","interval"):data[k]=int(data[k])
            except ValueError:
                raise ValueError("Sayısal ayarlara tam sayı girin.")
            session.action("save",data)
            cfg.update(session.cfg)
            update_languages()
            dialog.destroy()
            if source.get():prepare()
        button(pane,"Kaydet",lambda:alert(save),"main").grid(row=9,column=1,sticky="e")
    def update_languages():
        heading.set(f'{cfg["source_lang"]}  →  {cfg["target_lang"]}   ·   {cfg["model"]}')
        langs.configure(values=(cfg["target_lang"],cfg["source_lang"]))
        language.set(cfg["target_lang"])
    def close():
        nonlocal closing
        if session.action("state",{})["busy"]:
            if messagebox.askyesno("Varak","İşlemdeki parça kaydedildikten sonra pencere kapatılsın mı?",parent=root):
                session.action("pause",{})
                closing=True
        else:root.destroy()
    def poll():
        nonlocal plan,pagecount,running,lastpage
        while not bus.empty():
            ticket,result,error=bus.get_nowait()
            if generation!=ticket:continue
            plan=result
            phase.set("Hazır" if result else "Dosya okunamadı")
            status.set(f"{result[1]} / {result[0]} parça kayıtlı" if result else error)
        state=session.action("state",{})
        busy=started and state["busy"]
        if closing and not busy:
            root.destroy()
            return
        total,ready=plan or (0,0)
        done=state["done"] if started else ready
        if started and state["total"]:total=state["total"]
        seconds=None
        if total:
            left_count=max(0,total-ready-(state["fresh"] if started else 0))
            pace=state["seconds"]/state["samples"] if started and state["samples"] else 20
            seconds=left_count*pace
            if busy and state.get("batch_start") and left_count:
                seconds=max(1,seconds-min(pace,time.monotonic()-state["batch_start"]))
        if started:
            phase.set("Duraklatılıyor…" if busy and session.stop.is_set() else state["phase"])
            status.set(state["error"] or state["message"])
            if running and not busy:
                # Resume estimates start from the updated checkpoint count.
                if plan:plan=(total,max(ready, min(total,ready+state["fresh"])))
                if state["error"]:messagebox.showerror("Çeviri durdu",state["error"],parent=root)
            running=busy
        totalv.set(str(total) if total else "—")
        paused=started and not busy and state["phase"]!="Tamamlandı"
        if paused and plan:seconds=(plan[0]-plan[1])*(state["seconds"]/state["samples"] if state["samples"] else 20)
        remainv.set(duration(seconds) if seconds is not None else "—")
        endv.set(finish(seconds) if seconds is not None and seconds>0 and not paused else "—")
        note.set(("Tamamlanan API isteklerinin ortalama süresine göre tahmin." if started and state["samples"] else
                  "İlk tahmin parça başına 20 saniye varsayar. Kayıtlı parçalar süreden düşülür.")
                 if total else "Parça sayısı ve süre için bir Word kitabı seçin.")
        bar.configure(maximum=max(total,1),value=done)
        for widget,enabled in ((go,plan is not None and not busy),(pause,busy and not session.stop.is_set()),
                               (pick,not busy),(settings_btn,not busy),(word,started and bool(state["word"]))):
            widget.configure(state="normal" if enabled else "disabled")
        n=state["pages"] if started else 0
        if n!=pagecount:
            pagecount=n
            numbers.configure(values=tuple(range(1,n+1)))
        if n and (follow.get() or not jump.get()):jump.set(str(n))
        index=int(jump.get() or 0)-1
        tag=(generation,state["run"],index,language.get(),started)
        if tag!=lastpage:
            lastpage=tag
            text="İlk çeviri parçası burada görünecek."
            if started and 0<=index<n:
                data=session.action("page",{"index":index})
                text=data["tr" if language.get()==cfg["target_lang"] else "source"]
            content.configure(state="normal")
            content.delete("1.0","end")
            content.insert("1.0",text)
            content.configure(state="disabled")
            content.yview_moveto(0)
        root.after(250,poll)
    root.protocol("WM_DELETE_WINDOW",close)
    update_languages()
    poll()
    root.mainloop()
