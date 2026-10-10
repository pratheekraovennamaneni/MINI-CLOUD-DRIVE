const path = require('path');

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const isTextEditable = (filename) => {
  const textExtensions = [
    '.txt', '.md', '.json', '.js', '.ts', '.html', '.css',
    '.py', '.java', '.c', '.cpp', '.xml', '.env', '.yaml', '.yml'
  ];
  return textExtensions.includes(path.extname(filename).toLowerCase());
};

module.exports = {
  formatBytes,
  isTextEditable
};
