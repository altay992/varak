from desktop_start import launch
try:
    launch()
except Exception as e:
    from tkinter import messagebox
    messagebox.showerror("Varak 5.0",str(e))
