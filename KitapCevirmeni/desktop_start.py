"""Start the bundled Electron interface, installing its locked dependency on first use."""
import os
from pathlib import Path
import shutil
import subprocess
import sys


def launch():
    home = Path(__file__).resolve().parent
    panel = home / "panel"
    executable = panel / "node_modules" / "electron" / "dist"
    if sys.platform == "darwin":
        executable /= "Electron.app/Contents/MacOS/Electron"
    else:
        executable /= "electron.exe" if os.name == "nt" else "electron"
    if not executable.is_file():
        npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
        if not npm:
            raise RuntimeError("İlk kurulum için Node.js LTS ve npm gerekir. Node.js kurduktan sonra Varak'ı yeniden açın.")
        subprocess.run([npm, "ci", "--no-audit", "--no-fund"],cwd=panel,check=True)
    python = Path(sys.executable)
    if python.name.lower()=="pythonw.exe" and python.with_name("python.exe").is_file():
        python=python.with_name("python.exe")
    subprocess.Popen([str(executable),str(panel)],cwd=home,env=dict(os.environ,VARAK_PYTHON=str(python)))


if __name__=="__main__":
    launch()
