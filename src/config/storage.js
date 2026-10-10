const path = require('path');
const fs = require('fs');

const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

module.exports = {
  uploadDirectory,
  maxFileSize: 50 * 1024 * 1024 // 50MB
};
