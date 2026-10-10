const fs = require('fs');
const path = require('path');
const { uploadDirectory } = require('../config/storage');
const { formatBytes, isTextEditable } = require('../utils/fileUtils');

const metadataFilePath = path.join(uploadDirectory, '.metadata.json');

const loadMetadata = () => {
  if (!fs.existsSync(metadataFilePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveMetadata = (data) => {
  fs.writeFileSync(metadataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

const FileModel = {
  getAll: () => {
    return loadMetadata();
  },

  findById: (id) => {
    return loadMetadata().find((file) => file.id === id);
  },

  create: (fileData) => {
    const files = loadMetadata();
    const isText = isTextEditable(fileData.originalname);
    
    const newFile = {
      id: Date.now().toString(),
      originalName: fileData.originalname,
      storageName: fileData.filename,
      mimeType: fileData.mimetype,
      size: fileData.size,
      sizeFormatted: formatBytes(fileData.size),
      isText,
      uploadedAt: new Date().toISOString()
    };

    files.unshift(newFile);
    saveMetadata(files);
    return newFile;
  },

  delete: (id) => {
    const files = loadMetadata();
    const index = files.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const [deleted] = files.splice(index, 1);
    saveMetadata(files);
    return deleted;
  }
};

module.exports = FileModel;
