# Mini Cloud Drive

A minimalistic personal cloud drive web application with full CRUD support:
- Upload files (single/multiple)
- Preview & View images, PDFs, text, and media inline
- In-browser text/code/markdown editor with instant save
- Single-file download and one-click "Download All (ZIP)"
- File deletion

## Project Structure
```
mini-cloud-drive/
├── src/
│   ├── config/
│   │   └── storage.js
│   ├── controller/
│   │   └── fileController.js
│   ├── middleware/
│   │   ├── errMiddleware.js
│   │   └── multerMiddleware.js
│   ├── module/
│   │   └── file.js
│   ├── routes/
│   │   └── fileRoutes.js
│   ├── utils/
│   │   └── fileUtils.js
│   └── app.js
├── .env
├── package.json
└── server.js
```

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start server:
   ```bash
   npm start
   ```
3. Visit `http://localhost:3000`
