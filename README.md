# 📦 SheetZip Downloader

SheetZip Downloader is a Flask-based web application that allows users to upload Excel files, extract image URLs from selected sheets and columns, and download all images as a ZIP file with real-time progress tracking.

This tool is designed for bulk image extraction workflows where image links are stored inside Excel sheets.

---

## 🚀 Features

- 📊 Upload Excel files (`.xls`, `.xlsx`)
- 📄 Automatically detect available sheets
- 🔗 Select custom columns for:
  - Image URL
  - Image name
- 📦 Download all images as a **single ZIP file**
- 📈 Real-time progress bar with percentage
- 🧠 Avoids duplicate image downloads
- 🗑 Automatically deletes uploaded Excel files after 10 minutes
- ⚡ Smooth frontend (no page reloads)

---

## 🛠 Tech Stack

- **Backend:** Python, Flask
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Libraries:**
  - pandas
  - requests
  - openpyxl
  - zipfile
- **Communication:** REST API + Server-Sent Events (SSE)
