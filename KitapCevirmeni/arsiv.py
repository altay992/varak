"""Browse the actual book projects on disk, including previous Varak versions."""
import re


def inventory(base):
    books,files={},[]
    if not base.is_dir():
        return books,files
    for path in sorted(base.rglob("*.docx")):
        if path.name.startswith("~$"):
            continue
        relative=path.relative_to(base)
        project=relative.parts[0] if len(relative.parts)>1 else ""
        title=re.sub(r" - [0-9a-f]{10}$","",project) or "Diğer dosyalar"
        original=path.name=="Orijinal.docx" and len(relative.parts)==2
        if project:
            book=books.setdefault(project,{"title":title,"outputs":0,"copies":0,"date":0})
        if original:
            continue
        try:
            stat=path.stat()
        except FileNotFoundError:
            continue
        copy="Okuma kopyaları" in relative.parts[:-1]
        if project:
            book["copies" if copy else "outputs"]+=1
            book["date"]=max(book["date"],stat.st_mtime)
        edition=relative.parts[1] if len(relative.parts)>=3 else ""
        files.append((path,project,title,edition,copy,stat.st_mtime,stat.st_size))
    return books,sorted(files,key=lambda item:item[5],reverse=True)


