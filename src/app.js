const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/fileRoutes');
const errMiddleware = require('./middleware/errMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', fileRoutes);

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini Cloud Drive</title>
  <style>
    :root { --bg: #0f172a; --card: #1e293b; --text: #f8fafc; --accent: #38bdf8; --danger: #f87171; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; }
    .container { max-width: 900px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .upload-box { background: var(--card); border: 2px dashed #334155; border-radius: 8px; padding: 2rem; text-align: center; margin-bottom: 2rem; }
    .btn { background: var(--accent); color: #000; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-secondary { background: #334155; color: #fff; }
    table { width: 100%; border-collapse: collapse; background: var(--card); border-radius: 8px; overflow: hidden; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #334155; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); align-items: center; justify-content: center; }
    .modal.active { display: flex; }
    .modal-content { background: var(--card); padding: 1.5rem; border-radius: 8px; width: 90%; max-width: 700px; max-height: 80vh; overflow: auto; display: flex; flex-direction: column; gap: 1rem; }
    textarea { width: 100%; height: 350px; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px; padding: 10px; font-family: monospace; resize: vertical; box-sizing: border-box; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h2>☁️ Mini Cloud Drive</h2>
      <a href="/api/download-all" class="btn btn-secondary" id="downloadAllBtn">📦 Download All (ZIP)</a>
    </header>

    <div class="upload-box">
      <input type="file" id="fileInput" style="display:none" onchange="uploadSelectedFile()" />
      <p>Select a file to upload to your personal cloud</p>
      <button class="btn" onclick="document.getElementById('fileInput').click()">Choose & Upload File</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="fileList"></tbody>
    </table>
  </div>

  <div class="modal" id="viewerModal">
    <div class="modal-content">
      <h3 id="modalTitle" style="margin-top:0;">File Details</h3>
      <div id="modalBody"></div>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button class="btn" id="saveEditBtn" style="display:none;" onclick="saveTextEdit()">Save Changes</button>
      </div>
    </div>
  </div>

  <script>
    let activeEditingFileId = null;

    async function loadFiles() {
      const res = await fetch('/api/files');
      const data = await res.json();
      const tbody = document.getElementById('fileList');
      tbody.innerHTML = '';
      if (!data.files || data.files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No files uploaded yet.</td></tr>';
        document.getElementById('downloadAllBtn').style.opacity = '0.5';
        document.getElementById('downloadAllBtn').style.pointerEvents = 'none';
        return;
      }
      document.getElementById('downloadAllBtn').style.opacity = '1';
      document.getElementById('downloadAllBtn').style.pointerEvents = 'auto';

      data.files.forEach(f => {
        tbody.innerHTML += \`
          <tr>
            <td>\${f.originalName}</td>
            <td>\${f.sizeFormatted}</td>
            <td class="actions">
              <button class="btn btn-secondary" onclick="viewFile('\${f.id}', '\${f.originalName}', \${f.isText})">View</button>
              \${f.isText ? \`<button class="btn btn-secondary" onclick="editFile('\${f.id}', '\${f.originalName}')">Edit</button>\` : ''}
              <a class="btn btn-secondary" href="/api/download/\${f.id}">Download</a>
              <button class="btn btn-danger" onclick="deleteFile('\${f.id}')">Delete</button>
            </td>
          </tr>
        \`;
      });
    }

    async function uploadSelectedFile() {
      const fileInput = document.getElementById('fileInput');
      if (!fileInput.files[0]) return;
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      await fetch('/api/upload', { method: 'POST', body: formData });
      fileInput.value = '';
      loadFiles();
    }

    async function deleteFile(id) {
      if (!confirm('Are you sure you want to delete this file?')) return;
      await fetch('/api/delete/' + id, { method: 'DELETE' });
      loadFiles();
    }

    async function viewFile(id, name, isText) {
      const modal = document.getElementById('viewerModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const saveBtn = document.getElementById('saveEditBtn');
      saveBtn.style.display = 'none';
      title.innerText = 'Viewing: ' + name;

      if (isText) {
        const res = await fetch('/api/view/' + id + '?mode=raw_text');
        const data = await res.json();
        body.innerHTML = \`<pre style="background:#0f172a; padding:10px; border-radius:6px; overflow:auto; max-height:400px; white-space:pre-wrap;">\${data.content}</pre>\`;
      } else {
        body.innerHTML = \`<iframe src="/api/view/\${id}" style="width:100%; height:400px; border:none;"></iframe>\`;
      }
      modal.classList.add('active');
    }

    async function editFile(id, name) {
      activeEditingFileId = id;
      const modal = document.getElementById('viewerModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const saveBtn = document.getElementById('saveEditBtn');

      title.innerText = 'Editing: ' + name;
      saveBtn.style.display = 'inline-block';

      const res = await fetch('/api/view/' + id + '?mode=raw_text');
      const data = await res.json();
      body.innerHTML = \`<textarea id="fileEditorText">\${data.content}</textarea>\`;
      modal.classList.add('active');
    }

    async function saveTextEdit() {
      const content = document.getElementById('fileEditorText').value;
      await fetch('/api/edit/' + activeEditingFileId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      closeModal();
      loadFiles();
    }

    function closeModal() {
      document.getElementById('viewerModal').classList.remove('active');
    }

    loadFiles();
  </script>
</body>
</html>`);
});

app.use(errMiddleware);

module.exports = app;
