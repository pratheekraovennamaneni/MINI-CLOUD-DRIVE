const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const FileModel = require('../module/file');
const { uploadDirectory } = require('../config/storage');

exports.listFiles = (req, res, next) => {
  try {
    const files = FileModel.getAll();
    res.json({ success: true, files });
  } catch (error) {
    next(error);
  }
};

exports.uploadFile = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const record = FileModel.create(req.file);
    res.status(201).json({ success: true, file: record });
  } catch (error) {
    next(error);
  }
};

exports.viewFile = (req, res, next) => {
  try {
    const file = FileModel.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    const filePath = path.join(uploadDirectory, file.storageName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File missing from storage.' });
    }

    if (req.query.mode === 'raw_text') {
      const content = fs.readFileSync(filePath, 'utf-8');
      return res.json({ success: true, content, originalName: file.originalName });
    }

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

exports.editFile = (req, res, next) => {
  try {
    const file = FileModel.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ success: false, message: 'Content must be text string.' });
    }

    const filePath = path.join(uploadDirectory, file.storageName);
    fs.writeFileSync(filePath, content, 'utf-8');

    res.json({ success: true, message: 'File updated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.downloadFile = (req, res, next) => {
  try {
    const file = FileModel.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    const filePath = path.join(uploadDirectory, file.storageName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File does not exist.' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    next(error);
  }
};

exports.downloadAllFiles = (req, res, next) => {
  try {
    const files = FileModel.getAll();
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files to download.' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="cloud-drive-files.zip"');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    files.forEach(f => {
      const p = path.join(uploadDirectory, f.storageName);
      if (fs.existsSync(p)) {
        archive.file(p, { name: f.originalName });
      }
    });

    archive.finalize();
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = (req, res, next) => {
  try {
    const file = FileModel.delete(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    const filePath = path.join(uploadDirectory, file.storageName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'File deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
