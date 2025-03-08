import subprocess
import os

# Masukkan path video, file cookies, dan caption
VIDEO_PATH = input("Masukkan path video: ").strip()
COOKIE_FILE = input("Masukkan path cookies.json: ").strip()
CAPTION = input("Masukkan caption: ").strip()

# Path ke script uploader Node.js
NODE_SCRIPT = os.path.join(os.path.dirname(__file__), "backend/upload.js")

# Pastikan file tersedia
if not os.path.exists(COOKIE_FILE):
    print("File cookies tidak ditemukan.")
    exit(1)

if not os.path.exists(VIDEO_PATH):
    print("File video tidak ditemukan.")
    exit(1)

# Menjalankan Node.js script
try:
    subprocess.run(["node", NODE_SCRIPT, COOKIE_FILE, VIDEO_PATH, CAPTION], check=True)
except subprocess.CalledProcessError as e:
    print(f"Gagal mengunggah video: {e}")
