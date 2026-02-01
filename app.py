from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import requests
import os
import re
import uuid
import zipfile
import threading
import time
from flask import send_file



app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
DOWNLOAD_FOLDER = "downloads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

def clean_filename(name):
    return re.sub(r'[\\/:*?"<>|]', '_', str(name)).strip()

def delete_file_after_delay(path, delay=600):  # 600 sec = 10 min
    def delete():
        time.sleep(delay)
        if os.path.exists(path):
            os.remove(path)
           
    threading.Thread(target=delete, daemon=True).start()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    unique_name = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_name)
    file.save(filepath)

    excel = pd.ExcelFile(filepath)
    sheets = excel.sheet_names
    df = pd.read_excel(excel, sheet_name=sheets[0])
  
    columns = list(df.columns)
    excel.close()

    return jsonify({
        "file_path": filepath,
        "sheets": sheets,
        "columns": columns
    })

@app.route("/process", methods=["POST"])
def process_file():
    data = request.json

    file_path = data["file_path"]
    sheets = data["sheets"]
    url_col = data["url_column"]
    name_col = data["name_column"]

    excel = pd.ExcelFile(file_path)

    zip_id = str(uuid.uuid4())
    zip_path = os.path.join(DOWNLOAD_FOLDER, f"images_{zip_id}.zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for sheet in sheets:
            df = pd.read_excel(excel, sheet_name=sheet)

            for _, row in df.iterrows():
                url = row.get(url_col)
                name = row.get(name_col)

                if pd.isna(url) or pd.isna(name):
                    continue

                try:
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()

                    ext = url.split(".")[-1].split("?")[0]
                    safe_name = clean_filename(name)
                    filename = f"{safe_name}.{ext}"

                    zipf.writestr(filename, response.content)

                except Exception as e:
                    print(f"❌ Failed: {url} | {e}")

    excel.close()

    # 🔥 delete uploaded excel after 10 minutes
    delete_file_after_delay(file_path, delay=600)

    return send_file(
        zip_path,
        as_attachment=True,
        download_name="images.zip"
    )


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
