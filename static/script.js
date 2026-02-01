console.log("✅ Final JS loaded");

// TODO: Commented this
// window.addEventListener("beforeunload", function () {
//   alert("⚠️ PAGE IS RELOADING");
// });

// ELEMENTS
const fileInput = document.getElementById("excelFile");
const fileName = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const statusText = document.getElementById("status");

const configSection = document.getElementById("configSection");
const sheetsContainer = document.getElementById("sheetsContainer");
const urlColumnSelect = document.getElementById("urlColumn");
const nameColumnSelect = document.getElementById("nameColumn");
const startBtn = document.getElementById("startBtn");

let uploadedFilePath = "";

// SHOW FILE NAME
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
  }
});

// UPLOAD BUTTON CLICK (NO FORM, NO RELOAD)
uploadBtn.addEventListener("click", () => {
  console.log("📤 Upload button clicked");

  if (!fileInput.files.length) {
    statusText.textContent = "❌ Please select an Excel file";
    statusText.style.color = "red";
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  statusText.textContent = "⏳ Uploading file...";
  statusText.style.color = "blue";

  fetch("http://127.0.0.1:5000/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    })
    .then((data) => {
      console.log("✅ Upload success:", data);

      uploadedFilePath = data.file_path;
      renderConfigUI(data.sheets, data.columns);

      statusText.textContent = "✅ File uploaded successfully";
      statusText.style.color = "green";
    })
    .catch((err) => {
      console.error(err);
      statusText.textContent = "❌ Upload failed";
      statusText.style.color = "red";
    });
});

// RENDER CONFIG UI
function renderConfigUI(sheets, columns) {
  sheetsContainer.innerHTML = "";
  urlColumnSelect.innerHTML = "";
  nameColumnSelect.innerHTML = "";

  // TODO: commented your code
  sheets.forEach((sheet) => {
    const sheetDiv = document.createElement("div");
    sheetDiv.classList.add("sheet");
    sheetDiv.innerHTML = `<label>${sheet}<label> <input type="checkbox" value="${sheet}"/>`;

    sheetsContainer.appendChild(sheetDiv);
  });

  columns.forEach((col) => {
    const opt1 = document.createElement("option");
    opt1.value = col;
    opt1.textContent = col;

    const opt2 = opt1.cloneNode(true);

    urlColumnSelect.appendChild(opt1);
    nameColumnSelect.appendChild(opt2);
  });

  configSection.style.display = "block";
}

// START DOWNLOAD
startBtn.addEventListener("click", () => {
  console.log("🚀 Start download clicked");

  // TODO: CHANGED THIS AS IT WAS SELECTING CHECKBOXES
  const selectedSheets = Array.from(
    sheetsContainer.querySelectorAll("input[type='checkbox']:checked"),
  ).map((cb) => cb.value);

  const payload = {
    file_path: uploadedFilePath,
    sheets: selectedSheets,
    url_column: urlColumnSelect.value,
    name_column: nameColumnSelect.value,
  };

  statusText.textContent = "⏳ Downloading images...";
  statusText.style.color = "blue";

  fetch("http://127.0.0.1:5000/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      statusText.textContent = "✅ ZIP downloaded successfully";
      statusText.style.color = "green";
    })
    .catch((err) => {
      console.error(err);
      statusText.textContent = "❌ Download failed";
      statusText.style.color = "red";
    });
});

// fetch("http://127.0.0.1:5000/process", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify(payload),
// })
//   .then((res) => res.json())
//   .then((data) => {
//     console.log("✅ Download done:", data);
//     statusText.textContent = "✅ Download completed successfully";
//     statusText.style.color = "green";
//   })
//   .catch((err) => {
//     console.error(err);
//     statusText.textContent = "❌ Download failed";
//     statusText.style.color = "red";
//   });
